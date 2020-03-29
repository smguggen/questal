const server = require('express');
const app = server();
const fs = require('fs');
const path = require('path');

app.use(server.json());
app.use(server.urlencoded({ extended: true }));

app.post('/*', function(req, res, next) {
    let file = req.path.replace('/', '');
    let method = req.params && req.params.method ? req.params.method : 'index';
    let filePath = require(path.resolve(__dirname, `./controllers/${file}.js`));
    req.use = filePath[method];
    next();
});

app.post('/data', function(req, res) {
    req.use(res);
});

app.get('/data', function(req, res) {
    fs.readFile(path.resolve(__dirname, './data/data.json'), 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            res.json(data);
        }
    })
});

app.put('/*', function(req, res) {
    let file = path.join('./test', req.path);
    fs.writeFile(file, req.body.file, (err) => {
        if (err) {
            console.error(err);
            res.send(err);
        } else {
            res.send('PUT');
        }
    });
});

app.delete('/*', function(req, res) {
    let file = path.join('./test', req.path);
    if (fs.existsSync(file)) {
        fs.unlink(file, (err) => {
            if (err) {
                console.error(err);
                res.send(err);
            } else {
                res.send('DELETED');
            }
        });
    } else {
        res.send('File Not Found');
    }
});

app.use('/dist', server.static('./dist'));

app.use(server.static('./test', { extensions: ['html'] }));

app.listen(8080)