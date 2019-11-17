const _squireRequest = require('./lib/request.js');
const _squireGet = require('./lib/get.js');
const _squirePost = require('./lib/post.js');

module.exports = class extends _squireRequest {
    constructor() {
        super();
    }

    get Get() {
        return new _squireGet();
    }

    get Post() {
        return new _squirePost();
    }

    static get(url, data, options, settings) {
        let req = new _squireGet();
        return req.init(url, data, options, settings);
    }

    static post(url, data, options, settings) {
        let req = new _squirePost();
        return req.init(url, data, options, settings);
    }

}