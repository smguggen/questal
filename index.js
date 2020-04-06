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

module.exports = class extends Request {
    
    static get Client() {
        return Questal;
    }
    
    static get Server() {
        return Requestal;
    }
}