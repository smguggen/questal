const fs = require('fs');
const path = require('path');
const mini = require('terser');
const questalConfig = (root, fn) => {
    let dist = path.resolve(root, 'dist/questal.js');
    if (fs.existsSync(dist)) {
        fs.unlinkSync(dist);
    }

    function writeFiles(files, dir, stream) {
        files.forEach((key) => {
            let url = dir ? `${dir}/${key}.js` : `${key}.js`;
            let file = fs.readFileSync(path.resolve(root, url), 'utf-8');
            let str = /class/.exec(file);
            file = file.substring(str.index).replace(/module\.exports\s?\=.*$/, '');
            stream.write(file);
        });
    }

    let stream = fs.createWriteStream(dist);
    fn = fn || function(args) {
        if (args.err) {
            console.log(args.err);
        } else {
            console.log('success');
        }
    };
    let args = {
        err:null
    }
    stream.on('finish', () => {
        let min = dist.replace('.js', '.min.js');
        let file = fs.readFileSync(dist, 'utf-8');
        args.file = file;
        let mi = mini.minify(file);
        if (mi.error) {
            args.err = mi.error;
            fn(args);
            return;
        }
        args.min = mi.code;
        fs.writeFile(min, mi.code, 'utf-8', (err) => {
            args.err = err;
            fn(args);
        });
    });

    writeFiles(['util', 'events', 'data', 'headers', 'response'], 'src', stream);
    writeFiles(['request', 'get', 'post'], 'lib', stream);
    writeFiles(['index'], null, stream);

    stream.close();
}

module.exports = questalConfig;

