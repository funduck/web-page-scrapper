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
            // && all[i].innerHTML.match(/ANGORA GOLD/) // TEST
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

function getDominantColors () {

/*
 * Color Thief v2.0
 * by Lokesh Dhakar - http://www.lokeshdhakar.com
 *
 * Thanks
 * ------
 * Nick Rabinowitz - For creating quantize.js.
 * John Schulz - For clean up and optimization. @JFSIII
 * Nathan Spady - For adding drag and drop support to the demo page.
 *
 * License
 * -------
 * Copyright 2011, 2015 Lokesh Dhakar
 * Released under the MIT license
 * https://raw.githubusercontent.com/lokesh/color-thief/master/LICENSE
 *
 * @license
 */
var CanvasImage=function(a){this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),document.body.appendChild(this.canvas),this.width=this.canvas.width=a.width,this.height=this.canvas.height=a.height,this.context.drawImage(a,0,0,this.width,this.height)};CanvasImage.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height)},CanvasImage.prototype.update=function(a){this.context.putImageData(a,0,0)},CanvasImage.prototype.getPixelCount=function(){return this.width*this.height},CanvasImage.prototype.getImageData=function(){return this.context.getImageData(0,0,this.width,this.height)},CanvasImage.prototype.removeCanvas=function(){this.canvas.parentNode.removeChild(this.canvas)};var ColorThief=function(){};/*!
 * quantize.js Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * @license
 */
/*!
 * Block below copied from Protovis: http://mbostock.github.com/protovis/
 * Copyright 2010 Stanford Visualization Group
 * Licensed under the BSD License: http://www.opensource.org/licenses/bsd-license.php
 * @license
 */
if(ColorThief.prototype.getColor=function(a,b){var c=this.getPalette(a,5,b),d=c[0];return d},ColorThief.prototype.getPalette=function(a,b,c){"undefined"==typeof b&&(b=10),("undefined"==typeof c||c<1)&&(c=10);for(var d,e,f,g,h,i=new CanvasImage(a),j=i.getImageData(),k=j.data,l=i.getPixelCount(),m=[],n=0;n<l;n+=c)d=4*n,e=k[d+0],f=k[d+1],g=k[d+2],h=k[d+3],h>=125&&(e>250&&f>250&&g>250||m.push([e,f,g]));var o=MMCQ.quantize(m,b),p=o?o.palette():null;return i.removeCanvas(),p},!pv)var pv={map:function(a,b){var c={};return b?a.map(function(a,d){return c.index=d,b.call(c,a)}):a.slice()},naturalOrder:function(a,b){return a<b?-1:a>b?1:0},sum:function(a,b){var c={};return a.reduce(b?function(a,d,e){return c.index=e,a+b.call(c,d)}:function(a,b){return a+b},0)},max:function(a,b){return Math.max.apply(null,b?pv.map(a,b):a)}};var MMCQ=function(){function a(a,b,c){return(a<<2*i)+(b<<i)+c}function b(a){function b(){c.sort(a),d=!0}var c=[],d=!1;return{push:function(a){c.push(a),d=!1},peek:function(a){return d||b(),void 0===a&&(a=c.length-1),c[a]},pop:function(){return d||b(),c.pop()},size:function(){return c.length},map:function(a){return c.map(a)},debug:function(){return d||b(),c}}}function c(a,b,c,d,e,f,g){var h=this;h.r1=a,h.r2=b,h.g1=c,h.g2=d,h.b1=e,h.b2=f,h.histo=g}function d(){this.vboxes=new b(function(a,b){return pv.naturalOrder(a.vbox.count()*a.vbox.volume(),b.vbox.count()*b.vbox.volume())})}function e(b){var c,d,e,f,g=1<<3*i,h=new Array(g);return b.forEach(function(b){d=b[0]>>j,e=b[1]>>j,f=b[2]>>j,c=a(d,e,f),h[c]=(h[c]||0)+1}),h}function f(a,b){var d,e,f,g=1e6,h=0,i=1e6,k=0,l=1e6,m=0;return a.forEach(function(a){d=a[0]>>j,e=a[1]>>j,f=a[2]>>j,d<g?g=d:d>h&&(h=d),e<i?i=e:e>k&&(k=e),f<l?l=f:f>m&&(m=f)}),new c(g,h,i,k,l,m,b)}function g(b,c){function d(a){var b,d,e,f,g,h=a+"1",j=a+"2",k=0;for(i=c[h];i<=c[j];i++)if(o[i]>n/2){for(e=c.copy(),f=c.copy(),b=i-c[h],d=c[j]-i,g=b<=d?Math.min(c[j]-1,~~(i+d/2)):Math.max(c[h],~~(i-1-b/2));!o[g];)g++;for(k=p[g];!k&&o[g-1];)k=p[--g];return e[j]=g,f[h]=e[j]+1,[e,f]}}if(c.count()){var e=c.r2-c.r1+1,f=c.g2-c.g1+1,g=c.b2-c.b1+1,h=pv.max([e,f,g]);if(1==c.count())return[c.copy()];var i,j,k,l,m,n=0,o=[],p=[];if(h==e)for(i=c.r1;i<=c.r2;i++){for(l=0,j=c.g1;j<=c.g2;j++)for(k=c.b1;k<=c.b2;k++)m=a(i,j,k),l+=b[m]||0;n+=l,o[i]=n}else if(h==f)for(i=c.g1;i<=c.g2;i++){for(l=0,j=c.r1;j<=c.r2;j++)for(k=c.b1;k<=c.b2;k++)m=a(j,i,k),l+=b[m]||0;n+=l,o[i]=n}else for(i=c.b1;i<=c.b2;i++){for(l=0,j=c.r1;j<=c.r2;j++)for(k=c.g1;k<=c.g2;k++)m=a(j,k,i),l+=b[m]||0;n+=l,o[i]=n}return o.forEach(function(a,b){p[b]=n-a}),d(h==e?"r":h==f?"g":"b")}}function h(a,c){function h(a,b){for(var c,d=1,e=0;e<k;)if(c=a.pop(),c.count()){var f=g(i,c),h=f[0],j=f[1];if(!h)return;if(a.push(h),j&&(a.push(j),d++),d>=b)return;if(e++>k)return}else a.push(c),e++}if(!a.length||c<2||c>256)return!1;var i=e(a),j=0;i.forEach(function(){j++});var m=f(a,i),n=new b(function(a,b){return pv.naturalOrder(a.count(),b.count())});n.push(m),h(n,l*c);for(var o=new b(function(a,b){return pv.naturalOrder(a.count()*a.volume(),b.count()*b.volume())});n.size();)o.push(n.pop());h(o,c-o.size());for(var p=new d;o.size();)p.push(o.pop());return p}var i=5,j=8-i,k=1e3,l=.75;return c.prototype={volume:function(a){var b=this;return b._volume&&!a||(b._volume=(b.r2-b.r1+1)*(b.g2-b.g1+1)*(b.b2-b.b1+1)),b._volume},count:function(b){var c=this,d=c.histo;if(!c._count_set||b){var e,f,g,h=0;for(e=c.r1;e<=c.r2;e++)for(f=c.g1;f<=c.g2;f++)for(g=c.b1;g<=c.b2;g++)index=a(e,f,g),h+=d[index]||0;c._count=h,c._count_set=!0}return c._count},copy:function(){var a=this;return new c(a.r1,a.r2,a.g1,a.g2,a.b1,a.b2,a.histo)},avg:function(b){var c=this,d=c.histo;if(!c._avg||b){var e,f,g,h,j,k=0,l=1<<8-i,m=0,n=0,o=0;for(f=c.r1;f<=c.r2;f++)for(g=c.g1;g<=c.g2;g++)for(h=c.b1;h<=c.b2;h++)j=a(f,g,h),e=d[j]||0,k+=e,m+=e*(f+.5)*l,n+=e*(g+.5)*l,o+=e*(h+.5)*l;k?c._avg=[~~(m/k),~~(n/k),~~(o/k)]:c._avg=[~~(l*(c.r1+c.r2+1)/2),~~(l*(c.g1+c.g2+1)/2),~~(l*(c.b1+c.b2+1)/2)]}return c._avg},contains:function(a){var b=this,c=a[0]>>j;return gval=a[1]>>j,bval=a[2]>>j,c>=b.r1&&c<=b.r2&&gval>=b.g1&&gval<=b.g2&&bval>=b.b1&&bval<=b.b2}},d.prototype={push:function(a){this.vboxes.push({vbox:a,color:a.avg()})},palette:function(){return this.vboxes.map(function(a){return a.color})},size:function(){return this.vboxes.size()},map:function(a){for(var b=this.vboxes,c=0;c<b.size();c++)if(b.peek(c).vbox.contains(a))return b.peek(c).color;return this.nearest(a)},nearest:function(a){for(var b,c,d,e=this.vboxes,f=0;f<e.size();f++)c=Math.sqrt(Math.pow(a[0]-e.peek(f).color[0],2)+Math.pow(a[1]-e.peek(f).color[1],2)+Math.pow(a[2]-e.peek(f).color[2],2)),(c<b||void 0===b)&&(b=c,d=e.peek(f).color);return d},forcebw:function(){var a=this.vboxes;a.sort(function(a,b){return pv.naturalOrder(pv.sum(a.color),pv.sum(b.color))});var b=a[0].color;b[0]<5&&b[1]<5&&b[2]<5&&(a[0].color=[0,0,0]);var c=a.length-1,d=a[c].color;d[0]>251&&d[1]>251&&d[2]>251&&(a[c].color=[255,255,255])}},{quantize:h}}();

var colorThief = new ColorThief();

var els = document.querySelectorAll('a[data-id]');
var ids = {};
for (var i = 0; i < els.length; i++) {
    var id = els[i].getAttribute('data-id');
    ids[id] = colorThief.getColor(els[i].querySelector('img'));
}

return ids;

};

function downloadImagesFromPage (pId) {
    return function () {
        this.echo('downloading images for ' + meta[pId].name);

        var images = this.evaluate(function () {
            var els = document.querySelectorAll('a[data-id]');
            var ids = {};
            for (var i = 0; i < els.length; i++) { // TEST
                var id = els[i].getAttribute('data-id');
                ids[id] = {
                    file: id,
                    title: els[i].getAttribute('title'),
                    bilgi: els[i].getAttribute('data-bilgi')
                };
            }
            return ids;
        });

        //this.echo(JSON.stringify(images, null, '  '));
        var needDownload = false;

        if (!meta[pId].images) {
            needDownload = true;
            meta[pId].images = [];
        }

        if (meta[pId].images) {
            var toRM = [];
            var toSAVE = [];
            for (var i in meta[pId].images) {
                var imgId = meta[pId].images[i].id || meta[pId].images[i].filename.slice(String(pId).length + 1);
                this.echo('checking ' + imgId);
                if (!images[imgId] || !fs.exists(DOWNLOADS + meta[pId].images[i].filename)) {
                    toRM.push(meta[pId].images[i]);
                } else {
                    toSAVE.push(meta[pId].images[i]);
                    meta[pId].images[i].id = imgId;
                    delete images[imgId];
                }
            }
            meta[pId].images = toSAVE;
            if (Object.keys(images).length > 0) {
                needDownload = true;
            }
            for (var i in toRM) {
                this.echo('removing ' + toRM[i].filename);
                fs.remove(DOWNLOADS + toRM[i].filename);
            }
        }

        if (needDownload) {
            var imgUrl;
            var fileName;
            for (var i in images) {
                meta[pId].images.push({
                    id: i,
                    color: images[i].bilgi,
                    filename: pId + '_' + images[i].file
                });
                imgUrl = SITE + IMAGES + images[i].file;
                fileName = DOWNLOADS + pId + '_' + images[i].file;
                this.echo('downloading ' + imgUrl + ' to ' + fileName);
                this.download(imgUrl, fileName);
            }
        }

        this.echo('calculating dominant colors');
        delete meta[pId].colors;
        var colors = this.evaluate(getDominantColors);

        for (var i in meta[pId].images) {
            if (!meta[pId].images[i].rgb) {
                meta[pId].images[i].rgb = colors[meta[pId].images[i].id];
            }
        }

        meta[pId].colorsCalculated = true;
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
            if (!meta[curId] || !meta[curId].images || !meta[curId].info || !meta[curId].colorsCalculated) {
                this.echo('will download ' + links[i].name);
                count++;

                if (!meta[curId]) {
                    meta[curId] = {
                        id: curId,
                        name: links[i].name,
                        content: links[i].content,
                        weight: links[i].weight
                    };
                }

                if (!meta[curId].images || !meta[curId].colorsCalculated) {
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
                }

                if (!meta[curId].info) {
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
                }
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
