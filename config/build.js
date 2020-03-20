const Convene = require('convene');
const babel = require('@babel/core');

const convene = new Convene();
convene.queue({ lib: ['util', 'events', 'data', 'headers', 'response'], src: ['request', 'get', 'post', 'delete', 'questal'] }, 'require')
    .on('writing', (data) => data + '\n', true)
    .on('merged', convene.minify)
    .on('minify', data => babel.transformSync(data, {
        presets: ["@babel/preset-env"]
      }).code, true)
    .on('minified', convene.end)
    .merge(process.cwd() + '/dist/questal.js', 'dist');



