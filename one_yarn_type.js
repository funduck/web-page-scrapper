var casper = require('casper').create();
var fs = require('fs');

var SITE = 'http://www.alize.gen.tr';
var RESOURCE = '/images/';
var YARN_ID = '177';
var START =  '/yeni_site_ru/renkler.php?id=' + YARN_ID + '#';
var DOWNLOADS = 'downloads/alize_ru/';

casper.start();

casper.open(SITE + START, {
    headers: {
        'Cache-Control': 'max-age=0'
    }
});

function walkPage () {
    var images = this.evaluate(function () {
        var els = document.querySelectorAll('a[data-id]');
        var ids = {};
        for (var i = 0; i < els.length; i++) {
            ids[els[i].getAttribute('data-id')] = {
                file: els[i].getAttribute('data-id'),
                title: els[i].getAttribute('title'),
                bilgi: els[i].getAttribute('data-bilgi')
            };
        }
        return ids;
    });

    for (var i in images) {
      images[i].yarn_id = YARN_ID;
    }

    this.echo(JSON.stringify(images, null, '  '));

    var imgUrl;
    var fileName;
    for (var i in images) {
        imgUrl = SITE + RESOURCE + images[i].file;
        fileName = DOWNLOADS + images[i].yarn_id + '_' + images[i].bilgi.replace(/\s+/g, '_') + '_' + images[i].file;
        this.echo('downloading ' + imgUrl + ' to ' + fileName);
        this.download(imgUrl, fileName);
    }
};

function printHeaders (response) {
    this.echo(
        JSON.stringify(response.headers, null, '  ')
    );
}

function printPage () {
    fs.write('tmp', this.evaluate(function(){
        return document.documentElement.outerHTML;
    }), 'w');
}

casper.waitFor(
    function check () {
        return this.evaluate(function(){
            return document.querySelectorAll('a[data-id]').length;
        }) > 0
    },
    walkPage,
    printPage,
    10000
);

casper.then(printPage);

casper.run(function () {
    this.exit();
});
