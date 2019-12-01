const server = require('express');
const app = server();
const fs = require('fs');
const path = require('path');

app.post('/*', function(req, res, next) {
    let file = req.path.replace('/', '');
    let method = req.params && req.params.method ? req.params.method : 'index';
    let filePath = require(path.resolve(__dirname, `../controllers/${file}.js`));
    req.use = filePath[method];
    next();
});

app.post('/data', function(req, res) {
    req.use(res);
});

app.get('/data', function(req, res) {
    fs.readFile(path.resolve(__dirname, '../data/data.json'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            res.json(data);
        }
    })
});

app.use(server.static('.'));

app.listen(8080)