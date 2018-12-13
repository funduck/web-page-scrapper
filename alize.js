var casper = require('casper').create();
var fs = require('fs');

var SITE = 'http://www.alize.gen.tr';
var START =  '/index_ru.php?is=hand-knitting-yarn-collection';
var IMAGES = '/images/';
var COLORS = '/yeni_site_ru/renkler.php';
var DOWNLOADS = 'downloads/alize/';

var meta = readMeta();
var curId;

function checkIsStartPage () {
    return this.evaluate(function(){
        return document.querySelectorAll('div.product-details').length;
    }) > 0
};

function checkIsDataPage () {
    return this.evaluate(function(){
        return document.querySelectorAll('a[data-id]').length;
    }) > 0
};

function printPage () {
    fs.write('tmp', this.evaluate(function(){
        return document.documentElement.outerHTML;
    }), 'w');
};

function readMeta () {
    try {
        return JSON.parse(fs.read(DOWNLOADS + 'meta.json'));
    } catch (e) {
        return {};
    }
};

function writeMeta () {
    fs.write(DOWNLOADS + 'meta.json', JSON.stringify(meta, null, '  '), 'w');
};

function collectDataPageLinks () {
    var all = document.querySelectorAll('div.product-details');
    var res = [];
    for (var i = 0; i < all.length; i++) {
        var a = all[i].querySelector('a[href]');
        var re = a ? a.getAttribute('href').match(/^\?is=urun-detay&id=(\d+)$/) : null;
        if (re
            //&& all[i].innerHTML.match(/ANGORA/) // TEST
        ) {
            var name = a.querySelector('*').innerHTML;
            var content;
            var weight;
            var p = all[i].querySelectorAll('p');
            for (var j in p) {
                if (!content && p[j].innerHTML && p[j].innerHTML.match(/\%/)) {
                    content = p[j].innerHTML;
                } else {
                    weight = weight || p[j].innerHTML;
                }
            }
            res.push({
                id: re[1],
                name: name,
                content: content,
                weight: weight
            });
        }
    }
    return res;
};

function downloadImagesFromPage (pId) {
    return function () {
        var images = this.evaluate(function () {
            var els = document.querySelectorAll('a[data-id]');
            var ids = {};
            for (var i = 0; i < 3 /*els.length*/; i++) { // TEST
                ids[els[i].getAttribute('data-id')] = {
                    file: els[i].getAttribute('data-id'),
                    title: els[i].getAttribute('title'),
                    bilgi: els[i].getAttribute('data-bilgi')
                };
            }
            return ids;
        });

        //this.echo(JSON.stringify(images, null, '  '));

        meta[pId].images = [];

        var imgUrl;
        var fileName;
        for (var i in images) {
            meta[pId].images.push({
                color: images[i].bilgi,
                filename: images[i].file
            });
            imgUrl = SITE + IMAGES + images[i].file;
            fileName = DOWNLOADS + images[i].file;
            this.echo('downloading ' + imgUrl + ' to ' + fileName);
            this.download(imgUrl, fileName);
        }
    }
};

// LET IT BEGIN

casper.start(SITE + START);

// Соберем все страницы, которые нас интересуют
casper.waitFor(
    checkIsStartPage,
    function then () {
        var links = this.evaluate(collectDataPageLinks);

        //this.echo('will download all for links: ' + JSON.stringify(links, null, '  '));

        for (var i = 0; i < 2 /*links.length*/; i++) {  // TEST
            curId = links[i].id;
            if (!meta[curId]) {
                meta[curId] = {
                    name: links[i].name,
                    content: links[i].content,
                    weight: links[i].weight
                };
                this.echo('will download ' + JSON.stringify(links[i], null, '  '));
                this.thenOpen(SITE + COLORS + '?id=' + curId, function (pId) {
                    return function () {
                        this.waitFor(
                            checkIsDataPage,
                            downloadImagesFromPage(pId),
                            function () {
                                this.echo('no required elements found on page ' + pId);
                                printPage.call(this);
                                writeMeta(meta);
                                this.exit();
                            },
                            10000
                        );
                    }
                }(curId));
            } else {
                this.echo('already loaded ' + JSON.stringify(links[i]));
            }
        }
    },
    function () {
        this.echo('no required elements found on main page');
        printPage.call(this);
        this.exit();
    },
    10000
);

casper.run(function () {
    writeMeta(meta);
    this.exit();
});
