const sharp = require('sharp');
const meta = require('./downloads/alize/meta.json');
const downloads = 'downloads/alize'
const downloads_export = 'downloads/alize_export'
const when = require('when');
const fs = require('fs');
const TextToSVG = require('text-to-svg');
const textToSVG = TextToSVG.loadSync('fonts/AvenirNextCyr-Light.otf');

const processOneYarn = (yarnId) => {
    console.log('yarn', meta[yarnId].name);

    const images = meta[yarnId].images;
    return when.iterate(
        (i) => i + 1,
        (i) => i == images.length,
        (i) => {
            const imageFile = images[i].filename;
            const fout = downloads_export + '/' + 'with_color_' + imageFile
            const color = images[i].color;
            const text = color;

            try {
                fs.statSync(fout);
                console.log('already exists', fout);
                return;
            } catch (e) {}

            const img = sharp(downloads + '/' + imageFile);

            return img.metadata()
            .then((metadata) => {
                const fontSize = parseInt(70 * metadata.height / 1730, 10);
                const ttsOpts = {
                    x: 0,
                    y: fontSize,
                    fontSize: fontSize
                };
                const svg = textToSVG.getSVG(text, ttsOpts);
                const svgSize = textToSVG.getMetrics(text, ttsOpts);

                console.log('saving', fout);

                return img.overlayWith(new Buffer(svg), {
                    left: parseInt(metadata.width / 2 - svgSize.width / 2, 10),
                    top: metadata.height - parseInt(1.4 * fontSize, 10)
                })
                .toFile(fout);
            });
        },
        0
    );
};

const yarns = Object.getOwnPropertyNames(meta);

return when.iterate(
    (i) => i + 1,
    (i) => i == yarns.length,
    (i) => {
        return processOneYarn(yarns[i]);
    },
    0
)
.then(() => {
    process.exit(0);
});
