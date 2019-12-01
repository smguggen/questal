const QuestalGet = require('./lib/get.js');
const QuestalPost = require('./lib/post.js');
const QuestalUtil = require('./lib/util.js');

class Questal {

    request(method, options) {
        method = method ? method.toLowerCase() : null
        if (method == 'get') {
            return this.get(options);
        } else if (method == 'post') {
            return this.post(options);
        } else {
            let req = new QuestalRequest(options);
            req.method = method || null;
            return req;
        }
    }

    get(options) {
        return new QuestalGet(options);
    }

    post(options) {
        return new QuestalPost(options);
    }

    static Get(url, data, onSuccess, onError) {
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

    static Post(url, data, onSuccess, onError) {
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

module.exports = Questal;