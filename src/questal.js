const QuestalRequest = require('./request');
const QuestalGet = require('./get');
const QuestalPost = require('./post');
const QuestalDelete = require('./delete');
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
    
    put(url, data, options, delayRequest) {
        options = this._processOptions(options);
        let req = this.request('put', options);
        if (delayRequest) {
            return req;
        }
        return req.open(url, data).send(req.data.params);
    }

    patch(url, data, options, delayRequest) {
        options = this._processOptions(options);
        let req = this.request('patch', options);
        if (delayRequest) {
            return req;
        }
        return req.open(url, data).send(req.data.params);
    }

    head(url, options, delayRequest) {
        options = this._processOptions(options, 'responseHeaders');
        let req = this.request('head', options);
        if (delayRequest) {
            return req;
        }
        return req.open(url).send();
    }

    delete(url, options, delayRequest) {
        options = this._processOptions(options);
        let req = new QuestalDelete(options);
        if (delayRequest) {
            return req;
        }
        if (options.data) {
            return req.send(url, data);
        } else {
            return req.send(url);
        }
    }

    static Request() {
        return QuestalRequest();
    }

    static Get(url, data, onSuccess, onError) {
        if (typeof data === 'function') {
            onSuccess = data;
            onError = onSuccess;
            data = {};
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
    
    static Put(url, data, onSuccess, onError) {
        let q = new Questal();
       return q._staticTemplate('put', url, data, onSuccess, onError)
    }
    
    static Patch(url, data, onSuccess, onError) {
        let q = new Questal();
       return q._staticTemplate('patch', url, data, onSuccess, onError)
    }
    
    static Head(url, onSuccess, onError) {
        let q = new Questal();
       return q.head(url, { 
           success: onSuccess, 
           error:onError
       });
    }
    
    static Delete(url, onSuccess, onError) {
        let q = new Questal();
       return q.delete(url, { 
           success: onSuccess, 
           error:onError
       });
    }

    _processOptions(options, key) {
        key = key || 'success';
        options = options || {};
        if (typeof options === 'function') {
           options[key] = options;
        }
        return options;
    }
    
    _staticTemplate(type, url, data, success, error) {
        if (typeof data === 'function') {
            onSuccess = data;
            onError = onSuccess;
            data = {};
        }
        let req = this[type];
        if (typeof req === 'function') {
            return req(url, data, {
                success:success,
                error:error
            });
        }
        return null;
    }
}

module.exports = Questal;