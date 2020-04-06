const Requestal = require('requestal');
const Questal =  require('./src/questal');
const Request;
if (typeof exports === 'object' && typeof module !== 'undefined') {
    Request = Requestal
} else if (typeof window === 'object' && typeof XMLHttpRequest === 'function') {
    Request = Questal;
} else {
    throw new Error('Questal is not supported in this environment');
}

exports.client = Questal;
exports.server = Requestal;
module.exports = require('./src/questal');


