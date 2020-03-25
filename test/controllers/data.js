const fs = require('fs');
const path = require('path');

module.exports = {
    index: function(res) {
        fs.readFile(path.resolve(__dirname, '../data/data.json'), 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                let newData = JSON.parse(data)[0].names.map((row) => {
                    return `<tr><td>${row.id}.</td><td>${row.first} ${row.last}</td></tr>`;
                })
                res.json(newData);
            }
        })
    }
}