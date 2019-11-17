const fs = require('fs');
const path = require('path');
let dist = path.resolve(__dirname, '../dist/squire.js');
let mode = process.argv[2];
if (fs.existsSync(dist)) {
    fs.unlinkSync(dist);
}

function writeFiles(files, dir, stream, callback) {
    files.forEach((key) => {
        let name = callback(key);
        let url = dir ? `../${dir}/${key}.js` : `../${key}.js`;
        let file = fs.readFileSync(path.resolve(__dirname, url), 'utf-8');
        let str = /module\.exports/.exec(file);
        file = file.substring(str.index).replace(/module\.exports\s?\=[.\n\s]*/, `const ${name} = `);
        stream.write(file + '\n\n');
    });
}

let stream = fs.createWriteStream(dist);

stream.on('finish', () => {
    let min = dist.replace('.js', '.min.js');
    let file = fs.readFileSync(dist, 'utf-8');
    let ex = dist.replace('dist', 'example');
    if (mode == 'production') {
        const mini = require('terser');
        let mi = mini.minify(file);
        fs.writeFile(min, mi.code, 'utf-8', () => {
            fs.copyFile(min, ex, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('success');
                }
            })
        });
    } else {
        fs.copyFile(dist, ex, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('success');
            }
        });
    }
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
