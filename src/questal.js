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

    static Request() {
        return new QuestalRequest();
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

    _processOptions(options, key) {
        key = key || 'success';
        options = options || {};
        if (typeof options === 'function') {
           options[key] = options;
        }
        return options;
    }
}

Questal.prototype.put = function(url, data, options, delayRequest) {
    options = this._processOptions(options);
    let req = this.request('put', options);
    if (delayRequest) {
        return req;
    }
    return req.open(url, data).send(req.data.params);
}

Questal.prototype.patch = function(url, data, options, delayRequest) {
    options = this._processOptions(options);
    let req = this.request('patch', options);
    if (delayRequest) {
        return req;
    }
    return req.open(url, data).send(req.data.params);
}

Questal.prototype.head = function(url, options, delayRequest) {
    options = this._processOptions(options, 'responseHeaders');
    let req = this.request('head', options);
    if (delayRequest) {
        return req;
    }
    return req.open(url).send();
}

Questal.prototype.delete = function(url, options, delayRequest) {
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

