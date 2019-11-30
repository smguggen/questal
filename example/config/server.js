const server = require('express');
const app = server();
const fs = require('fs');
const path = require('path');



app.post('/data', function(req, res) {
    fs.readFile(path.resolve(__dirname, '../data.json'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            res.json(data);
        }
    })
});

app.use(server.static('.'));

app.listen(3000)