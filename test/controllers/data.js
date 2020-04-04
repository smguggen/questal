const fs = require('fs');
const path = require('path');

module.exports = {
    index: function(req, res) {
        fs.readFile(path.resolve(__dirname, '../data/data.json'), 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                data = JSON.parse(data)[0];
                if (req.body && Object.keys(req.body).length) {
                    data.names[0] = Object.assign({}, data.names[0], req.body);
                }
                let newData = data.names.map((row) => {
                    return `<tr><td>${row.id}.</td><td>${row.first} ${row.last}</td></tr>`;
                })
                res.json(newData);
            }
        })
    }
}