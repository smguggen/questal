const QuestalRequest = require('./lib/request.js');
const QuestalGet = require('./lib/get.js');
const QuestalPost = require('./lib/post.js');

module.exports = class extends QuestalRequest {
    constructor() {
        super();
    }

    static Get() {
        return new QuestalGet();
    }

    static Post() {
        return new QuestalPost();
    }

    static get(url, data, onSuccess, onError) {
        //TODO fix option params
        if (typeof data === 'function') {
            onSuccess = data;
            onError = onSuccess;
        }
        let req = new QuestalGet({
            success:onSuccess,
            error:onError
        });

        return req.send(url, data);
    }

    static post(url, data, onSuccess, onError) {
        if (typeof data === 'function') {
            onSuccess = data;
            onError = onSuccess;
        }
        let req = new QuestalPost({
            success:onSuccess,
            error:onError
        });
        return req.send(url, data);
    }

}