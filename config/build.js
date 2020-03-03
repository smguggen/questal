const Convene = require('convene');
const config = new Convene();
config.add(['util', 'events', 'data', 'headers', 'response'], 'lib');
config.add(['request', 'get', 'post', 'delete', 'questal'], 'src');
config.write('questal', 'dist', true);


