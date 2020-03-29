const Convene = require('convene');
const { transformSync } = require('@babel/core');
const convene = new Convene();
const ProtoQuestal = require('@srcer/questal-proto');
let files = [ 
    ProtoQuestal,
    { lib: [ 'events', 'headers', 'response' ] },
    { src: [ 'request', 'get', 'post', 'delete', 'questal' ] } 
];

convene.queue(files, 'require')
    .on('writing', data => data + '\n', true)
    .on('minify', data => transformSync(data, {
        presets: ["@babel/preset-env"]
      }).code, true)
    .on('merged', convene.minify)
    .on('clear', () => {
        convene.requeue(files, 'require')
        .on('writing', data => {
            data = data + '\n\n'; 
            if (data.startsWith('class Questal {')) {
                data += 'export default Questal;';
            }
            return data;
        }, true)
        .merge(process.cwd() + '/dist/questal.es.js', true)
    })
    .merge(process.cwd() + '/dist/questal.js', 'dist');



