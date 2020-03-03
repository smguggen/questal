const Config = require('./index.js');
const config = new Config();
config.add(['util', 'events', 'data', 'headers', 'response'], 'lib');
config.add(['request', 'get', 'post', 'delete', 'questal'], 'src');

config.write('questal', 'dist', true);


