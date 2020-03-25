const Convene = require('convene');
const { transformSync } = require('@babel/core');

const convene = new Convene();
convene.queue([ { lib: ['events', 'util', 'data', 'headers', 'response'], src: ['request', 'get', 'post', 'delete', 'questal'] } ], 'require')
    .on('writing', data => data + '\n', true)
    .on('minify', data => transformSync(data, {
        presets: ["@babel/preset-env"]
      }).code, true)
    .on('merged', convene.minify)
    .on('clear', () => {
        convene.requeue([ '@srcer/events/src/callback', '@srcer/events/src/event', '@srcer/events', { lib: ['events', 'util', 'data', 'headers', 'module-headers', 'response', 'module-response'], src: ['request', 'module', 'get', 'post', 'delete', 'questal'] } ], 'require')
        .on('writing', data => {
            data = data + '\n\n'; 
            if (data.startsWith('class Questal {')) {
                data += 'export default Questal;';
            }
            return data;
        }, true)
        .merge(process.cwd() + '/dist/questal.module.js', true)
    })
    .merge(process.cwd() + '/dist/questal.js', 'dist');



