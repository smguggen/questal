const fs = require('fs');
const path = require('path');
const config = require('../../config/index.js');
let mode = process.argv[2] || 'development';
let root = path.resolve(process.cwd(), '../');
config(root, (args) => {
    let dest = mode == 'production' && args.min ? args.min : args.file;
    dest += 'export default Squire';
    fs.writeFile(path.resolve(__dirname, '../squire.js'), dest, 'utf-8', (err) => {
        if (err) {
            console.log(err);
        } else if (args.err) {
            console.log(args.err);
        } else {
            console.log('success');
        }
    })
});