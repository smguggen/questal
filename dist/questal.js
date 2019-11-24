const QuestalUtil = class {

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
}

const QuestalEvents = class {
    constructor(events) {
        events = events || [];
        this.eventNames = events;
        this.events = this.eventNames.reduce((acc, event) => {
            acc[event] = [];
            return acc;
        }, {});
    }

    on(event, callback) {
        this.event = event;
        this.events[event].push(callback);
        return this;
    }

    fire(event, ...params) {
        let $this = this;
        params = params && params.length ? params : null;

        if (!this.events[event] || !this.events[event].length) {
            return;
        }
        let ev = this.events[event];
        for (let i = 0; i < ev.length; i++) {
            let fn = ev[i];
            if (params) {
                fn.apply($this, params);
            } else {
                fn.call($this);
            }
        }
        return this;
    }

    set event(event) {
        if (!this.eventNames.includes(event)) {
            this.eventNames.push(event);
        }
        if (!this.events[event]) {
            this.events[event] = [];
        }
    }

    add(event) {
        if (!Array.isArray(event)) {
            event = [event];
        }
        let $this = this;
        event.forEach((ev) => {
            $this.event = ev;
        });
    }

    schedule(event, ...params) {
        let $this = this;
        if (this.eventNames.includes(event) && this.events[event] && this.events[event].length) {
            return (...args) => {
                args = args.concat(params);
                $this.fire(event, ...args);
            }
        } else {
            return false;
        }
    }
}

const QuestalData = class {

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

const QuestalHeader = class {
    constructor(sender) {
        this.sender = sender;
        this.headers = {};
    }

    set accept(type) {
        if (!this._accept) {
            this._accept = [];
        }
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
        if (res == '*/*') {
          this._accept = ['*/*'];
        } else if (!this._accept.includes(res)) {
            this._accept.push(res);
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
                    this.sender.setRequestHeader(key, value);
                }
                if (this.accept) {
                    this.sender.setRequestHeader('Accept', this.accept);
                }
                if (this.encoding) {
                    this.sender.setRequestHeader('Content-Type', this.encoding);
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
        if (this.sender.readyState >= 2) {
            console.log('Headers already sent');
            return false;
        } else {
            return true;
        }
    }
}

const QuestalResponse = class {
    constructor(sender) {
        this.sender = sender;
        this.defaultType = 'text';
        this.types = ['arraybuffer', 'blob', 'document', 'text', 'json'];
    }

    get headers() {
        let res = this.sender.getAllResponseHeaders();
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
        let res = this.sender.response;
        this.type = oldType;
        return res;
    }

    get url() {
        return this.sender.responseURL;
    }

    get result() {
        return this.sender.responseText;
    }

    get json() {
        let res = this.result
        try {
            return JSON.parse(res);
        } catch(e) {
            return res;
        }
    }

    get xml() {
        return this.sender.responseXML;
    }
    get html() {
        if (this.type == 'document') {
            return this.sender.responseXML;
        } else {
            return '';
        }
    }

    set type(type) {
        type = type == 'buffer' ? 'arraybuffer' : type;
        if (this.types.includes(type) && this.sender.readyState < 2) {
                this.sender.responseType = type;
        } else {
            console.log('Headers already sent');
        }
    }
    get type() {
        return this.sender.responseType;
    }

    get status() {
        return this.sender.statusText;
    }

    get code() {
        return this.sender.status;
    }

    isSuccess() {
        return this.code >= 200 && this.code < 300;
    }



}

const QuestalRequest = class {
    constructor() {
        this.sender = new XMLHttpRequest();
        this.events = new QuestalEvents(['init', 'ready', 'responseHeaders', 'loadStart', 'change', 'complete', 'success', 'progress', 'abort', 'error', 'timeout']);
        this.header = new QuestalHeader(this.sender);
        this.response = new QuestalResponse(this.sender);
        this._data = new QuestalData();
        this._setDefaultEvents();
    }

    set url(url) {
        if (!QuestalUtil.typecheck(url)) {
            return;
        }
        let urls = url.split('?');
        this._url = urls[0];
        if (urls.length > 1) {
            this.data = urls[1];
        }
    }

    get url() {
        return this._url;
    }

    get state() {
        let st = this.sender.readyState;
        let arr = ['unsent', 'ready', 'responseHeaders', 'loadStart', 'complete'];
        return arr[st];
    }

    set data(data) {
        this._data.data = data;
    }
    get data() {
        return this._data.data;
    }
    get params() {
        return this._data.params;
    }

    abort() {
        this.sender.abort();
        return this;
    }

    get(key) {
        return this.sender[key];
    }

    set(key, value) {
        let $this = this;
        switch(key) {
            case 'credentials':$this.sender.withCredentials = value;
            break;
            default:$this.sender[key] = value;
        }
        return this;
    }

    on(event, callback) {
        if (this.events.eventNames.includes(event)) {
            this.events.on(event, callback);
        }
    }

    init(method, url, options, settings) {
        options = options || {};
        if (typeof options === "function") {
            options = {
                success: options
            }
            if (typeof settings === "function") {
                options.error = settings;
            }
        }
        let keys = Object.keys(options);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (this.events.eventNames.includes(key)) {
                this.on(key, options[key]);
            }
        }
        this.events.fire('init');
        this.set('timeout', options.timeout || 60000);
        let com = this.events.schedule('complete');
        let prog = this.events.schedule('progress');
        let ch = this.events.schedule('change');
        let err = this.events.schedule('error');
        let ab = this.events.schedule('abort');
        let time = this.events.schedule('timeout');
        if (com) {
            this.set('onload',com);
        }
        if (prog) {
            this.set('onprogress', prog);
        }
        if (ch) {
            this.set('onreadystatechange', ch);
        }
        if (err) {
            this.set('onerror', err);
        }
        if (ab) {
            this.set('onabort', ab);
        }
        if (time)  {
            this.set('ontimeout', time);
        }
        this.sender.open(method, url);
        this.sender.send();
        return this;
    }


    _onChange() {
        let $this = this;
        this.on('change', () =>{
            switch($this.type) {
                case 'ready': $this.fire('ready');
                break;
                case 'responseHeaders': $this.fire('responseHeaders');
                break;
                case 'loadStart': $this.fire('loadStart');
                break;
            }
        });
    }

    _onReady() {
        let $this = this;
        this.on('ready', () => {
            $this.header.init();
        });
    }

    _onComplete() {
        let $this = this;
        this.on('complete', (event) => {
           if ($this.response.isSuccess()) {
               $this.events.fire('success', $this.response);
           }
        });
    }

    _setDefaultEvents() {
        this._onChange();
        this._onReady();
        this._onComplete();
    }
}

const QuestalGet = class extends QuestalRequest {
    constructor() {
        super();
    }

    get method() {
        return 'get';
    }
    set method(m) {

    }

    init(url, options) {
        let $this = this;
        options = options || {};
        this.url = url;
        this.data = options.data || {};
        let query = this.params ? url + '?' + this.params : url;
        this.on('send', () => {
           let type = options.accept || ['plain', 'xml', 'html'];
           $this.header.accept = type;
           $this.header.init();
        });
        return super.init(this.method, query, options);
    }
}

const QuestalPost = class extends QuestalRequest {
    constructor() {
        super();
    }

    get method() {
        return 'post';
    }
    set method(m) {

    }
    
    

    init(url, data, options, settings) {
        let $this = this;
        this.url = url;
        this.data = data || options || {};
        options = options || {};
        this.on('send', () => {
           let type = options.accept || ['application/json'];
           $this.accept(type);
        });
        return super.init(this.method, this.url, options, settings);
    }

}

const Questal = class extends QuestalRequest {
    constructor() {
        super();
    }

    static Get() {
        return new QuestalGet();
    }

    static Post() {
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

