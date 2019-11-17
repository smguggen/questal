const SquireRequest = require('./lib/request.js');
const SquireGet = require('./lib/get.js');
const SquirePost = require('./lib/post.js');

module.exports = class extends SquireRequest {
    constructor() {
        super();
    }

    get Get() {
        return new SquireGet();
    }

    get Post() {
        return new SquirePost();
    }

    static get(url, data, options, settings) {
        let req = new SquireGet();
        return req.init(url, data, options, settings);
    }

    static post(url, data, options, settings) {
        let req = new SquirePost();
        return req.init(url, data, options, settings);
    }

}