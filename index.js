const QuestalRequest = require('./lib/request.js');
const QuestalGet = require('./lib/get.js');
const QuestalPost = require('./lib/post.js');

module.exports = class extends QuestalRequest {
    constructor() {
        super();
    }

    get Get() {
        return new QuestalGet();
    }

    get Post() {
        return new QuestalPost();
    }

    static get(url, data, options, settings) {
        let req = new QuestalGet();
        return req.init(url, data, options, settings);
    }

    static post(url, data, options, settings) {
        let req = new QuestalPost();
        return req.init(url, data, options, settings);
    }

}