const meta = require('./downloads/alize/meta.json');

var table = [];
for (var id in meta) {
    var rc = meta[id];
    var row = {
        'id': rc.id,
        'name': rc.name.trim(),
        'content': rc.content.trim(),
        'length/weight': rc.weight.trim(),
        'crochet needle': rc.info["Crochet Needle"],
        'knitting needle': rc.info["Knitting Needle"],
        'pack': rc.info["Package"],
        'season': rc.info["Season"],
        'yarn type': rc.info["Yarn Type"]
    };
    table.push(row);
}

const Json2csvParser = require('json2csv').Parser;
const opts = { fields: [
        'id',
        'name',
        'content',
        'length/weight',
        'crochet needle',
        'knitting needle',
        'pack',
        'season',
        'yarn type'
] };

try {
  const parser = new Json2csvParser(opts);
  const csv = parser.parse(table);
  console.log(csv);
} catch (err) {
  console.error(err);
}
