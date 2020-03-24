const Convene = require('convene');
const babel = require('@babel/core');

const convene = new Convene();
convene.queue([ '@srcer/events/src/callback', '@srcer/events/src/event', '@srcer/events', { lib: ['events', 'util', 'data', 'headers', 'response'], src: ['request', 'get', 'post', 'delete', 'questal'] } ], 'require')
    .on('writing', (data) => data + '\n', true)
    .on('minify', data => babel.transformSync(data, {
        presets: ["@babel/preset-env"]
      }).code, true)
    .on('merged', convene.minify)
    .on('clear', () => {
        convene.requeue([ '@srcer/events/src/callback', '@srcer/events/src/event', '@srcer/events', { lib: ['events', 'util', 'data', 'headers', 'response'], src: ['request', 'get', 'post', 'delete', 'questal'] } ], 'require')
        .on('writing', (data) => {
            return 'export ' + data + '\n\n'; 
        }, true)
        .merge(process.cwd() + '/dist/questal.module.js', true)
    })
    .merge(process.cwd() + '/dist/questal.js', 'dist');



