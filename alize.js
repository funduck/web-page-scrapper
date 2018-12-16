var casper = require('casper').create();
var fs = require('fs');

var SITE = 'http://www.alize.gen.tr';
var START =  '/index_ru.php?is=hand-knitting-yarn-collection';
var IMAGES = '/images/';
var YARN = '/yeni_site_ru/index.php?is=urun-detay&';
var COLORS = '/yeni_site_ru/renkler.php?';
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
            var content = null;
            var weight = null;
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
        this.echo('downloading images for ' + meta[pId].name);

        var images = this.evaluate(function () {
            var els = document.querySelectorAll('a[data-id]');
            var ids = {};
            for (var i = 0; i < els.length; i++) { // TEST
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
                filename: pId + '_' + images[i].file
            });
            imgUrl = SITE + IMAGES + images[i].file;
            fileName = DOWNLOADS + pId + '_' + images[i].file;
            this.echo('downloading ' + imgUrl + ' to ' + fileName);
            this.download(imgUrl, fileName);
        }
    }
};

function downloadInfoFromPage (pId) {
    return function () {
        this.echo('fetching info for ' + meta[pId].name);

        meta[pId].info = this.evaluate(function () {
            var json = {};
            var els = document.querySelector('#t_teknik').querySelectorAll('.media-body');
            for (var i = 0; i < els.length; i++) {
                var name = els[i].querySelector('h5').innerHTML;
                var value = els[i].querySelector('p').innerHTML;
                json[name] = value;
            }
            return json;
        });
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

        var count = 0;

        for (var i = 0; i < links.length; i++) {  // TEST
            // пориции
            if (count >= 100) {
                break;
            }

            curId = links[i].id;
            if (!meta[curId]) {
                count++;

                meta[curId] = {
                    id: curId,
                    name: links[i].name,
                    content: links[i].content,
                    weight: links[i].weight
                };

                this.echo('will download ' + links[i].name);

                this.thenOpen(SITE + COLORS + 'id=' + curId, function (pId) {
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

                this.thenOpen(SITE + YARN + 'id=' + curId, function (pId) {
                    return function () {
                        this.waitFor(
                            checkIsDataPage,
                            downloadInfoFromPage(pId),
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
                this.echo('already loaded ' + links[i].name);
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
