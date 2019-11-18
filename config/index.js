const fs = require('fs');
const path = require('path');
const mini = require('terser');
const squireConfig = (root, fn) => {
    let dist = path.resolve(root, 'dist/squire.js');
    if (fs.existsSync(dist)) {
        fs.unlinkSync(dist);
    }

    function writeFiles(files, dir, stream, callback) {
        files.forEach((key) => {
            let name = callback(key);
            let url = dir ? `${dir}/${key}.js` : `${key}.js`;
            let file = fs.readFileSync(path.resolve(root, url), 'utf-8');
            let str = /module\.exports/.exec(file);
            file = file.substring(str.index).replace(/module\.exports\s?\=[.\n\s]*/, `const ${name} = `);
            stream.write(file + '\n\n');
        });
    }

    let stream = fs.createWriteStream(dist);
    fn = fn || function(args) {
        if (args.err) {
            console.log(err);
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

    writeFiles(['util', 'events', 'data', 'header', 'response'], 'src', stream, (key) => {
        return `Squire${key.substring(0,1).toUpperCase() + key.substring(1)}`;
    });
    writeFiles(['request', 'get', 'post'], 'lib', stream, (key) => {
        return `Squire${key.substring(0,1).toUpperCase() + key.substring(1)}`;
    });
    writeFiles(['index'], null, stream, (key) => {
        return 'Squire';
    });

    stream.close();
}

module.exports = squireConfig;

