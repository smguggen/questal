class QuestalUtil {

    static getType(input) {
        if (input instanceof RegExp) {
            return 'regex';
        } else if (typeof input === 'object') {
            if (typeof obj !== 'object') {
                return false;
            }
            if (obj == null) {
                return 'null';
            } else if (Array.isArray(obj)) {
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

class QuestalEvents {
    constructor(target, caller) {
        this.target = target;
        this.caller = caller || target;
    }

    on(event, callback) {
        event = event.split(' ');
        let $this = this;
        event.forEach((ev) => {
            $this.target.addEventListener(ev, function(e) {
                let detail = e.detail || $this.target;
                callback.call($this.caller, detail, e);
            });
        });
        return this;
    }

    off(event, callback) {
        if (typeof callback === 'function' && callback.name) {
            callback = callback.name;
        }
        this.target.removeEventListener(event, callback);
        return this;
    }

    fire(event, detail, options) {
        options = options || {};
        this.target.dispatchEvent(new CustomEvent(event, {
            bubbles: options.bubbles || false,
            detail: detail || options.detail || null,
            cancelable: options.cancelable || false,
            composed: options.composed || false
        }));
    }
}

class QuestalData {

    set data(data) {
        this.setData(data);
    }
    set params(params) {
        this.setData(params);
    }
    get data() {
        return this._data || {};
    }
    get params() {
        return this._params || '';
    }

    setData(info) {
        if (!this._data) {
            this._data = {};
        }
        if (!this._params) {
            this._params = '';
        }
        let data = {},
        params = '',
        type = QuestalUtil.getType(info);
        if (type == 'object') {
            data = info;
            params = this.parseParamsToString(info);
        } else if (type == 'string') {
            data = this.parseParamsToObject(info);
            params = info;
        }

        this._data = Object.assign({}, this._data, data);
        this._params += params;
    }

    parseParamsToObject(str) {
        str = str || '';
        if (str.substring(0,1) == '?') {
            str = str.substring(1);
        }
        return str.split('&').reduce((acc, param) => {
            let parts = param.split('=');
            acc[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
            return acc;
        }, {});
    }

    parseParamsToString(obj, withMark) {
        obj = obj || {};
        let data = withMark ? '?' : '';
        let str = Object.keys(obj).reduce((acc, param) => {
            acc += encodeURIComponent(params) + '=' + encodeURIComponent(obj[param]);
            return acc;
        }, '').join('&');
        return data + str;
    }
}

class QuestalHeaders {
    constructor(request) {
        this.settings = request;
        this.headers = {};
    }

    set accept(type) {
        if (!this._accept) {
            this._accept = [];
        }
        if (Array.isArray(type)) {
            if (type.includes('*') || type.includes('*/*')) {
                this._accept = ['*/*'];
                return;
            }
            let $this = this;
            type.forEach((typ) => {
                $this._parseAccept(typ);
            });
        } else {
            if (['*', '*/*'].includes(type)) {
                this._accept = ['*/*'];
                return;
            }
            this._parseAccept(type);
        }
    }
    get accept() {
        if (!this._accept) {
            this._accept = [];
        }
        if (this._accept.includes('*/*')) {
            return '*/*';
        } else {
            return this._accept.join(',');
        }
    }

    set encoding(type) {
        let $this = this;
        switch(type) {
            case 'multipart': $this._encoding = 'multipart/form-data';
            case 'form':
            break;
            case 'plain': $this._encoding = 'text/plain';
            break;
            default:$this._encoding = 'application/x-www-form-urlencoded';
            break;
        }
    }
    get encoding() {
        if (!this._encoding) {
            return 'application/x-www-form-urlencoded';
        } else {
            return this._encoding;
        }
    }

    set(key, value) {
         if (key.toLowerCase() == 'accept') {
                this.accept = value;
            } else if (key == 'encoding' || key == 'Content-Type' || key == 'content') {
                this.encoding = value;
            } else if (!this.isForbidden(key)) {
                this.headers[key] = value;
            }
        return this;
    }

    init() {
        if (this.sendable) {
            let keys = Object.keys(this.headers);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let value = this.headers[key];
                if (!this.isForbidden(key)) {
                    this.settings.setRequestHeader(key, value);
                }
                if (this.accept) {
                    this.settings.setRequestHeader('Accept', this.accept);
                }
                if (this.encoding) {
                    this.settings.setRequestHeader('Content-Type', this.encoding);
                }
            }
        }
        return this;
    }

    isForbidden(key) {
       key = key.trim();
       if (key.startsWith('Sec-') || key.startsWith('Proxy-')) {
           return true;
       }
       let forbidden = ['Accept-Charset','Accept-Encoding','Access-Control-Request-Headers','Access-Control-Request-Method','Connection','Content-Length','Cookie','Cookie2','Date','DNT','Expect','Host','Keep-Alive','Origin','Referer','TE','Trailer','Transfer-Encoding','Upgrade','Via'];
       if (forbidden.includes(key)) {
           return true;
       }
       return false;
    }

    sendable() {
        if (this.settings.readyState >= 2) {
            return false;
        } else {
            return true;
        }
    }

    _parseAccept(type) {
        let res;
        switch(type) {
            case 'json': res = 'application/json';
            break;
            case 'html':res = 'text/html';
            break;
            case 'xml': res = 'application/xml, application/xhtml+xml';
            break;
            case 'plain': res = 'text/plain';
            break;
            default: res = type;
            break;
        }
        if (!this._accept.includes(res)) {
            this._accept.push(res);
        }
    }
}

class QuestalResponse {
    constructor(request) {
        this.settings = request;
        this.defaultType = 'text';
        this.types = ['arraybuffer', 'blob', 'document', 'text', 'json'];
    }

    get headers() {
        let res = this.settings.getAllResponseHeaders();
        let result = {};
        if (res) {
            result = res.split('\r\n').reduce((acc, header) => {
                let parts = header.split(':');
                if (parts && parts.length == 2) {
                    let key = QuestalUtil.toCamelCase(parts[0]);
                    if (['contentType', 'cacheControl'].includes(key)) {
                        let separator = key == 'contentType' ? ';' : ',';
                        let sets = parts[1].split(separator);
                        let val = sets[0].trim();
                        acc[key] = val;
                        if (key == 'contentType') {
                            acc.encoding = val.split('/')[1];
                        }
                        if (sets.length > 1) {
                            let params = sets[1].split('=');
                            if (params.length > 1) {
                                let param = QuestalUtil.toCamelCase(params[0]);
                                acc[param] = params[1].trim();
                            }
                        }
                    } else {
                        acc[key] = parts[1].trim();
                    }
                }
                return acc;
            }, {});
        }
        if (this.type) {
            result.responseType = this.type;
        }
        return result;
    }

    get data() {
        let oldType = this.type;
        this.type = 'json';
        let res = this.settings.response;
        this.type = oldType;
        return res;
    }

    get url() {
        return this.settings.responseURL;
    }

    get result() {
        if (['', 'text'].includes(this.type)) {
            return this.settings.responseText;
        } else {
            return this.settings.response;
        }
    }

    get json() {
        let res = this.result
        try {
            let json = JSON.parse(res);
            return typeof json === 'string' ? JSON.parse(json) : json;
        } catch(e) {
            return res;
        }
    }

    get xml() {
        return this.settings.responseXML;
    }
    get html() {
        if (this.type == 'document') {
            return this.settings.responseXML;
        } else {
            return '';
        }
    }

    set type(type) {
        type = type == 'buffer' ? 'arraybuffer' : type;
        if (this.types.includes(type) && this.settings.readyState < 2) {
                this.settings.responseType = type;
        } else {
            console.assert(false, 'Can\'t set ' + type + '. Headers already sent');
        }
    }
    get type() {
        return this.settings.responseType;
    }

    get status() {
        return this.settings.statusText;
    }

    get code() {
        return this.settings.status;
    }

    isSuccess() {
        let code = this.code;
        if (code == 304) {
            console.warn("Response Code 304: Server returned cached version of data");
        }
        return code >= 200 && (code < 300 || code == 304);
    }
}

class QuestalRequest {
    constructor(options) {
        this.options = options || {};
        this.settings = new XMLHttpRequest();
        this.headers = new QuestalHeaders(this.settings);
        this.response = new QuestalResponse(this.settings);
        this.events = new QuestalEvents(this.settings, this);
        this.eventNames = ['init', 'ready', 'responseHeaders', 'loadStart', 'change', 'complete', 'success', 'progress', 'abort', 'error', 'timeout'];
        this.data = new QuestalData();
        this._init();
    }

    set method(m) {
        this._method = m;
    }
    get method() {
        return this._method;
    }

    set url(url) {
        url =  url || '';
        let urls = url.split('?');
        this._url = urls[0];
        if (urls.length > 1) {
            this.data.params = urls[1];
        }
    }

    get url() {
        if (this.method == 'get' && this.data.params) {
            return this._url + '?' + this.data.params;
        } else {
            return this._url;
        }
    }

    get state() {
        let st = this.settings.readyState;
        let arr = ['unsent', 'ready', 'responseHeaders', 'loadStart', 'complete'];
        return arr[st];
    }

    set options(opt) {
        opt = opt || {};
        if (!this._options) {
            this._options = {};
        }
        this._options = Object.assign({}, this._options, opt);
    }

    get options() {
        return this._options || {};
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        let $this = this;
        switch(key) {
            case 'credentials':$this.settings.withCredentials = value;
            break;
            default:$this.settings[key] = value;
        }
        return this;
    }

    open(url, data) {
        this._presend(url, data);
        this.settings.open(this.method, this.url);
        // ready event fires
        return this;
    }

    send(body) {
        if (this.state == 'ready') {
            this.settings.send(body);
        } else {
            throw new Error(`Request can\t be sent with a ready state of \"${this.state}\".`);
        }
        return this;
    }

    on(event, callback) {
        if (['progress', 'abort', 'error', 'timeout'].includes(event)) {
            event = '_' + event;
        }
        this.events.on(event, callback);
    }

    off(event, callback) {
        if (['progress', 'abort', 'error', 'timeout'].includes(event)) {
            event = '_' + event;
        }
        this.events.off(event, callback);
    }

    abort() {
        this.settings.abort();
        return this;
    }

    onLoad() {
        let $this = this;
        this.on('load', function() {
            $this.events.fire('complete', $this.response);
            if ($this.response.isSuccess()) {
                $this.events.fire('success', $this.response);
            }
        });
    }

    onChange() {
        let $this = this;
        this.on('readystatechange', function() {
            $this.events.fire('change');
            switch($this.state) {
                case 'ready': $this.events.fire('ready');
                break;
                case 'responseHeaders': $this.events.fire('responseHeaders', $this.headers);
                break;
                case 'loadStart': $this.events.fire('loadStart');
                break;
            }
        });
    }

    onReady() {
        this.on('ready', function() {
            this.headers.init();
        });
    }

    _init() {
        let $this = this;
        this.url = this.options.url;
        this.method = this.options.method || 'get';
        this.data.params = this.options.data || this.options.params;
        this.set('timeout', this.options.timeout || 60000);
        this.onLoad();
        this.onChange();
        this.on('progress', function(e) {
            $this.events.fire('_progress', e);
        });
        this.on('abort', function() {
            $this.events.fire('_abort');
        });
        this.on('error', function(e) {
            $this.events.fire('_error', e);
        });
        this.on('timeout', function() {
            $this.events.fire('_timeout');
        });

        this.onReady();
        this.setOptions(this.options);
    }

    setOptions(options) {
        options = options || {};
        let keys = Object.keys(options);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let option = options[key];
            if (this.eventNames.includes(key)) {
                this.on(key, option);
            } else {
                this.set(key, option);
            }
        }
    }

    _presend(url, data) {
        if (url) {
            this.url = url;
        }
        if (data) {
            this.data.params = data;
        }
        this.events.fire('init');
        if (!this.method) {
            throw new Error('Request method is empty');
        } else if (!this.url) {
            throw new Error('Request Url is invalid');
        } else {
            return true;
        }
    }

}

class QuestalGet extends QuestalRequest {
    constructor(options) {
        super(options);
    }

    get method() {
        return 'get';
    }
    set method(m) {

    }

    open() {
        return null;
    }

    send(url, data) {
        super.open(url, data)
        super.send();
    }

    _onReady(options) {
        let $this = this;
        this.on('ready', () => {
            let type = options.accept || ['plain', 'xml', 'html'];
            $this.headers.accept = type;
            $this.headers.init();
        });
    }
}

class QuestalPost extends QuestalRequest {
    constructor(options) {
        super(options);
    }

    get method() {
        return 'post';
    }
    set method(m) {

    }

    open() {
        return null;
    }

    send(url, data) {
        super.open(url, data);
        super.send(this.data.params);
    }

    onReady(options) {
        let $this = this;
        options = options || this.options;
        this.on('ready', () => {
            let type = options.accept || ['application/json'];
            $this.headers.accept = type;
            $this.headers.init();
        });
    }

}

class Questal {
    constructor(type, options) {
        this.options = options || {};
        if (type) {
            type = QuestalUtil.ucfirst(this.method);
            this.request = Function(`return new Questal${type}()`).call();
        } else {
            this.request = null;
        }
    }

    Get(options) {
        this.options = Object.assign({}, this.options, options || {});
        this.request = new QuestalGet(this.options);
        return this.request;
    }

    Post(options) {
        this.options = Object.assign({}, this.options, options || {});
        this.request = new QuestalPost(this.options);
        return this.request;
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
}

