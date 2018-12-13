var casper = require('casper').create();
var fs = require('fs');
var SITE = 'http://www.alize.gen.tr';
var START =  '/index_ru.php?is=urun-detay&id=177#';

casper.start();

casper.open(SITE + START, {
    headers: {
        'Cache-Control': 'max-age=0'
    }
});

function walkPage () {
    var images = this.evaluate(function () {
        var theme = document.querySelector('h2.text-theme-colored').innerHTML.replace(/\s+/g, '_');

        var els = document.querySelectorAll('a[data-id]');
        var ids = {};
        for (var i = 0; i < els.length; i++) {
            ids[els[i].getAttribute('data-id')] = {
                theme: theme,
                file: els[i].getAttribute('data-id'),
                title: els[i].getAttribute('title'),
                bilgi: els[i].getAttribute('data-bilgi')
            };
        }
        return ids;
    });

    this.echo(JSON.stringify(images, null, '  '));
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
