var casper = require('casper').create();

var SITE = 'http://www.alize.gen.tr';
var START = '/index_ru.php?is=urun-detay&id=177#';
var RESOURCE = '/images/';
var DOWNLOADS = 'downloads/alize/';

casper.start(SITE + START);

casper.waitFor(
    function check () {
        return this.evaluate(function(){
            return document.querySelectorAll('a[data-id]').length;
        }) > 0
    },
    function then () {
        var images = this.evaluate(function () {
            var els = document.querySelectorAll('a[data-id]');
            var ids = {};
            for (var i = 0; i < els.length; i++) {
                ids[els[i].getAttribute('title')] = els[i].getAttribute('data-id');
            }
            return ids;
        });

        this.echo(JSON.stringify(images, null, '  '));

        var imgUrl;
        var fileName;
        for (var imgName in images) {
            imgUrl = SITE + RESOURCE + images[imgName];
            fileName = DOWNLOADS + imgName.replace(/\s*/g, '') + '_' + images[imgName];
            this.echo('downloading ' + imgUrl + ' to ' + fileName);
            this.download(imgUrl, fileName);
        }
    },
    function timeout () {
        this.echo('no required elements found');
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
