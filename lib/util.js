const QuestalRequest = require('../src/request');
const QuestalModule = require('../src/module');
class QuestalUtil {
    
    static get Request() {
        let Request;
        if (typeof exports === 'object' && typeof module !== 'undefined' && typeof QuestalModule === 'function') {
            Request = QuestalModule;
        } else if (typeof XMLHttpRequest === 'function') {
            Request = QuestalRequest;
        } else {
            throw new Error('Questal is not supported in this environment');
        }
        return Request;
    }
    
    static getType(input) {
        if (input instanceof RegExp) {
            return 'regex';
        } else if (typeof input === 'object') {
            if (input == null) {
                return 'null';
            } else if (Array.isArray(input)) {
                return 'array';
            } else {
                return 'object';
            }
        } else {
            return typeof input;
        }
    }

    static typecheck(input, type) {
        type = type || 'string';
        var test;
        switch (type) {
            case 'array': test = Array.isArray(input);
            break;
            case 'object': test = typeof input === 'object' && input != null && !Array.isArray(input);
            break;
            case 'regex': test = input instanceof RegExp;
            break;
            case 'null': test = !input;
            case 'undefined':
            case 'false':
            break;
            case 'true': test = input ? true : false;
            break;
            default: test = typeof input === type;
            break;
        }
        return test ? true : false;
    }

    static toCamelCase(str) {
        str = str || '';
        return str.split('-').map((prop, ind) => {
            if (ind > 0) {
                return prop.substring(0,1).toUpperCase() + prop.substring(1);
            } else {
                return prop;
            }
        }).join('').trim();
    }

    static ucfirst(str) {
        if (!str || typeof str !== 'string') {
            return str;
        }
        return str.substring(0,1).toUpperCase() + str.substring(1).toLowerCase();
    }
}

module.exports = QuestalUtil;