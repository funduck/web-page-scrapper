var casper = require('casper').create();

var SITE = 'http://www.alize.gen.tr';
var START =  '/index_ru.php?is=hand-knitting-yarn-collection'; // '/index_ru.php?is=urun-detay&id=177#';
var RESOURCE = '/images/';
var DOWNLOADS = 'downloads/alize/';

casper.start(SITE + START);

// Загрузчик с страницы конкретной пряжи
function downloadImagesFromPage () {
    var images = this.evaluate(function () {
        var theme = document.querySelector('h2.text-theme-colored').innerHTML.replace(/\s+/g, '_');

        var els = document.querySelectorAll('a[data-id]');
        var ids = {};
        for (var i = 0; i < els.length; i++) {
            ids[els[i].getAttribute('data-id')] = {
                theme: theme,
                file: els[i].getAttribute('data-id'),
                title: els[i].getAttribute('title')
            };
        }
        return ids;
    });

    this.echo(JSON.stringify(images, null, '  '));

    var imgUrl;
    var fileName;
    for (var i in images) {
        imgUrl = SITE + RESOURCE + images[i].file;
        fileName = DOWNLOADS + images[i].theme + '_' + images[i].title.replace(/\s+/g, '_') + '_' + images[i].file;
        this.echo('downloading ' + imgUrl + ' to ' + fileName);
        this.download(imgUrl, fileName);
    }
}

// Соберем все страницы, которые нас интересуют
casper.waitFor(
    function check () {
        return this.evaluate(function(){
            return document.querySelectorAll('li a[href]').length;
        }) > 0
    },
    function then () {
        var links = this.evaluate(function () {
            var all = document.querySelectorAll('li a[href]');
            var res = [];
            for (var i = 0; i < all.length; i++) {
                if (all[i].getAttribute('href').match(/^\?is=urun-detay&id=\d+$/)
                    //&& all[i].innerHTML.match(/ANGORA/) // TEST
                ) {
                    res.push('/index_ru.php' + all[i].getAttribute('href'));
                }
            }
            return res;
        });

        this.echo('will download all for links: ' + JSON.stringify(links, null, '  '));

        for (var i = 0; i < links.length; i++) {
            this.thenOpen(SITE + links[i], function () {
                this.waitFor(
                    function check () {
                        return this.evaluate(function(){
                            return document.querySelectorAll('a[data-id]').length;
                        }) > 0
                    },
                    downloadImagesFromPage,
                    function timeout () {
                        this.echo('no required elements found on page ' + links[i]);
                        //this.debugPage();
                        this.echo(this.evaluate(function(){
                            return document.documentElement.outerHTML;
                        }));
                    },
                    10000
                );
            });
        }

    },
    function timeout () {
        this.echo('no required elements found on main page');
        //this.debugPage();
        this.echo(this.evaluate(function(){
            return document.documentElement.outerHTML;
        }));
    },
    10000
);

casper.run(function () {
    this.exit();
});
