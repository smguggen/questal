const QuestalGet = require('./lib/get.js');
const QuestalPost = require('./lib/post.js');
const QuestalUtil = require('./lib/util.js');

module.exports = class {
    constructor(type, options) {
        this.options = options || {};
        if (type) {
            type = QuestalUtil.ucfirst(this.method);
            this.request = Function(`return new Questal${type}()`).call();
        } else {
            this.request = null;
        }
    }

    get active() {
        return this.request ? true : false;
    }

    get method() {
        if (!this.active) {
            return null;
        }
        return this.request.method;
    }

    set method(m) {
        return;
    }

    Get(options) {
        this.options = object.assign({}, options || {}, this.options);
        this.request = new QuestalGet(this.options);
        return this;
    }

    Post(options) {
        this.options = object.assign({}, options || {}, this.options);
        this.request = new QuestalPost(this.options);
        return this;
    }

    reset(options) {
        if (this.active) {
            this.request.abort();
        }
        if (options) {
            this.options = options || {};
        }
        let type = QuestalUtil.ucfirst(this.method);
        return this[type](this.options);
    }

    static get(url, data, onSuccess, onError) {
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