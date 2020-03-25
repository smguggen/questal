class SrcerCallback {
    constructor(index, callback, type) {
        if (typeof callback !== 'function') {
            callback = this.default;
        }
        this.index = index;
        this.active = true;
        this.type = type;
        this.function = callback;
        let types = ['before', 'after', 'first', 'last', 'calc'];
        types.forEach(t => {
            Object.defineProperty(this, t, 
                { get: function() { return this.type == t } }    
            )
        }, this);
    }
    
    activate() {
        this.active = true;
        return this;
    }
    
    deactivate() {
        this.active = false;
        return this;
    }
    
    set function(fn) {
        if (typeof fn === 'function') {
            this._function = fn;
        } 
    }
    
    get function() {
        return this._function || this.default;
    }
    
    set type(o) {
        if (!['first', 'before', 'after', 'last', 'calc'].includes(o)) {
            this._type = 'any';
        }    
        this._type = o;
    }
    
    get type() {
        return this._type || 'any';
    }
    
    get default() {
        return this.type == 'calc' ? this._defaultCalc : this._default;
    }
    
    get order() {
        switch(this.type) {
            case 'first': return 1;
            break;
            case 'before': return 2;
            break;
            case 'after': return 4;
            break;
            case 'last': return 5;
            break;
            default: return 3;
            break;
        }
    }
    
    _default() {
        
    }
    
    _defaultCalc(arg) {
        return arg;
    }
}

class SrcerEvent {
    constructor(name) {
        if (!name) {
            throw new Error('Event name is required');
        }
        if (typeof name !== 'string') {
            throw new Error('Event name must be a string');
        }
        this.name = name;
        this._queue = {}
        this._calc = new SrcerCallback(name + '-0', null, 'calc');
        this.hasCalc = false;
        this._index = 0;
        this.count = 0;
        this.active = true;
    }

    get length() {
        return Object.values(this._queue).length;
    }

    get index() {
        this._index++;
        return this.name + '-' + this._index;
    }

    get queue() {
        return this.getCallbacks();
    }

    fire(caller, ...args) {
        let q = this.queue;
        this.count++;
        q.forEach(cb => {
            if (cb.active) {
                cb.function.call(caller, ...args);
            }
        }, this);
        return this;
    }

    calc(caller, ...args) {
        this.count++;
        if (this._calc.active) {
            return this._calc.function.call(caller, ...args);
        } else {
            return args && args.length ? args[0] : null;
        }
    }

    on(callback, option) {
        let index = this.index;
        if (option == 'first') {
            let oldFirst = this.getCallback('first');
            if (oldFirst) {
                oldFirst.type = 'before';
            }
        } else if (option == 'last') {
            let oldLast = this.getCallback('last');
            if (oldLast) {
                oldLast.type = 'after';
            }
        }
        if (typeof callback === 'string') {
            if (this._queue[callback] && this._queue[callback] instanceof SrcerCallback) {
                this._queue[callback].activate();
                return callback;
            } else if (this._calc && this._calc.index == callback) {
                this._calc.activate();
                return callback;
            }
        }
        let cb = new SrcerCallback(index, callback, option);
        if (cb.calc) {
            this.hasCalc = true;
            this._calc = cb;
        } else {
            this._queue[index] = cb;
        }
        return index;
    }

    onCalc(callback) {
        return this.on(callback, 'calc');
    }

    after(callback) {
        return this.on(callback, 'after');
    }

    before(callback) {
        return this.on(callback, 'before');
    }

    last(callback) {
        return this.on(callback, 'last');
    }

    first(callback) {
        return this.on(callback, 'last');
    }

    off(key) {
        if (this._queue.hasOwnProperty(key)) {
            this._queue[key].deactivate();
        } else if (this._calc.index == key) {
            this._calc.deactivate();
        } else {
            this.active = false;
        }
        return this;
    }

    reset() {
        this._queue = {};
        return this;
    }

    getCallbacks() {
        let q = Object.values(this._queue);
        q.sort((a, b) => {
            if (a.order == b.order) {
                return 0;
            }
            return a.order - b.order;
        });
        return q;
    }

    getCallback(key) {
        let len = this.length;
        if (!len) {
            return null;
        }
        if (key == 'last') {
            return this.queue[len - 1];
        } else if (key == 'first') {
            return this._queue[0];
        }
        return this._queue[key].function;
    }

    getCalc() {
        return this._calc.function;
    }
    
    set active(a) {
        if (a) {
            this._active = true;
        } else {
            this._active = false;
            this.reset();
        }
    }
    
    get active() {
        return this._active === false ? false : true;
    }

    set _queue(q) {
        let oldQ = this.__queue || {};

        this.__queue = q;

        if (!this.__queue || typeof this.__queue !== 'object' || Array.isArray(this.__queue)) {
            this.__queue = oldQ;
        }

    }

    get _queue() {
        return this.__queue || {};
    }
}

class SrcerEvents {
    constructor(caller) {
        caller = caller || this;
        this.setCaller(caller);
        this._events = {}
        this._index = 0;
        let types = ['before', 'after', 'first', 'last', 'calc'];
        types.forEach(type => {
            let method = type == 'calc' ? 'onCalc' : type;
            this[method] = this._updateTypes(type);
        }, this);
    }
    
    get length() {
        return this.events.filter(ev => ev.active).length;
    }
    
    get index() {
        this._index++;
        return 'ev-' + this._index;
    }
    
    on(event, callback, option) {
        if (option && typeof option === 'boolean') {
            option = 'calc';
        }
        this.event = event;
        return this.update(event, 'on', callback, option);
     }
     
     off(event, key) {
        this.update(event, 'off', key);
        return this;
     }
     
     fire(event, ...args) {
        if (!this.exists(event)) {
            this.event = event;
            this.get(event).active = false;
        }
        this.update(event, 'fire', this.caller, ...args); 
        return this;
     }
     
     calc(event, ...args) {
        if (!this.exists(event)) {
            this.event = event;
            this.get(event).active = false;
        }
        return this.update(event, 'calc', this.caller, ...args);
     }
    
    set event(e) {
        if (this.exists(e) && !this.isActive(e)) {
            this._events[e].active = true;
            return;
        }
        if (!this.exists(e)) {
            this._events[e] = new SrcerEvent(e, this.caller);
        }
    }
    
    set events(e) {
        if (!e) {
            return;
        }
        if (Array.isArray(e)) {
            e.forEach(name => {
                this.event = name;
            }, this);
        } else if (typeof e === 'string') {
            this.event = e;
        }
    }
    
    get events() {
        return Object.keys(this._events) || [];
    }
    
    get state() {
        let $this = this;
        return Object.keys(this._events).reduce((acc, e) =>{
            let ev = $this._events[e];
            if (ev.length || ev.hasCalc) {
                acc[e] = ev;
            }
            return acc;
        }, {});
    }
    
    get(event) {
        if (event && typeof event !== 'string' && event instanceof SrcerEvent) {
            return event;
        }
        return this._events[event];
    }
    
    count(event) {
        if (this.exists(event)) {
            return this.get(event).count;
        }
        return 0;
    }
    
    setCaller(caller) {
        if (!caller || 
            (typeof caller !== 'function' &&
            typeof caller != 'object')
        ) {
           caller = this; 
        }
        this.caller = caller;
        return this;
    }
    
    exists(ev) {
        let e = this.get(ev);
        return e && e instanceof SrcerEvent;
    }
    
    isActive(ev) {
        let e = this.get(ev);
        return e && e instanceof SrcerEvent && e.active;
    }
    
    reset(event) {
        if (event) {
            this.update(event, 'reset');
        } else {
            this.events.forEach(ev => {
               this._events[ev].active = false; 
            });
        }
        return this;
    }
    
    update(event, callback, ...args) {
        let ev = this.get(event);
        let res = false;
        if (ev instanceof SrcerEvent) {
            if (typeof callback === 'string' && typeof ev[callback] === 'function') {
                res = ev[callback].call(ev, ...args);
            } else if (typeof callback === 'function') {
                res = callback.call(this.caller, ev, ...args);
            }   
        }
        return res;
    }
    
    _updateTypes(type) {
        return function(event, callback) {
            return this.on(event, callback, type);
        }
    }
    
    static get instance() {
        return new SrcerEvents();
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
        let CustomEv = this.getCustomEvent();
        options = options || {};
        this.target.dispatchEvent(new CustomEv(event, {
            bubbles: options.bubbles || false,
            detail: detail || options.detail || null,
            cancelable: options.cancelable || false,
            composed: options.composed || false
        }));
    }
    
    _customEventPolyfill() {
        return function(event, params) {
            params = params || { bubbles: false, cancelable: false, detail:null };
            var evt = document.createEvent( 'CustomEvent' );
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
            return evt;
        }
    }
    
    getCustomEvent() {
        if ( typeof window.CustomEvent === "function" ) {
            return window.CustomEvent;
        }
        return this._customEventPolyfill()
    }
}

class QuestalUtil {
    
    static get Request() {
        let Request;
        if (typeof exports === 'object' && typeof module !== 'undefined' && typeof QuestalModule === 'function') {
            Request = QuestalModule;
        } else if (typeof XMLHttpRequest === 'function') {
            Request = QuestalRequest;
        } else {
            throw new Error('Questal is not supported in this environment');
        }
        return Request;
    }
    
    static getType(input) {
        if (input instanceof RegExp) {
            return 'regex';
        } else if (typeof input === 'object') {
            if (input == null) {
                return 'null';
            } else if (Array.isArray(input)) {
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
        let str = Object.keys(obj).map((param) => {
            return encodeURIComponent(param) + '=' + encodeURIComponent(obj[param]);
        }).join('&');
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
            }
            if (this.accept) {
                this.settings.setRequestHeader('Accept', this.accept);
            }
            if (this.encoding) {
                this.settings.setRequestHeader('Content-Type', this.encoding);
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

class ModuleHeaders extends QuestalHeaders {
    constructor(options) {
        super(options);
    }
    
    sendable() {
        return true;
    }
    
    init() {
        let keys = Object.keys(this.headers);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = this.headers[key];
            if (!this.isForbidden(key)) {
                this.settings[key] = value;
            }
        }
        if (this.accept) {
            this.settings['Accept'] = this.accept;
        }
        if (this.encoding) {
            this.settings['Content-Type'] = this.encoding;
        }
        return this;
    }
}

class QuestalResponse {
    constructor(request, omitBody) {
        this.hasBody = !omitBody;
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

    get url() {
        return this.settings.responseURL;
    }

    get result() {
        if (this.hasBody) {
            if (['', 'text'].includes(this.type)) {
                return this.settings.responseText;
            } else {
                return this.settings.response;
            }
        } else {
            return this.headers;
        }
    }

    get text() {
         if (this.hasBody) {
            let res = this.json;
            try {
                return JSON.stringify(res);
            } catch(e) {
                return res.toString();
            }
         } else {
             return '';
         }
    }

    get json() {
        if (this.hasBody) {
        let res = this.result
            try {
                let json = JSON.parse(res);
                return typeof json === 'string' ? JSON.parse(json) : json;
            } catch(e) {
                return res;
            }
        } else {
            return [];
        }
    }

    get xml() {
        if (this.hasBody) {
            return this.settings.responseXML;
        } else {
            return '';
        }
    }
    get html() {
        if (this.hasBody && this.type == 'document') {
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
            if (!this.types.includes(type)) {
                console.error(`Type ${type} is not a valid response type`);
            } else {
                console.error('Can\'t set ' + type + '. Headers already sent');
            }
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
        return code >= 200 && code < 300;
    }

    success304(code) {
        if (code == 304) {
            console.warn("Response Code 304: Server returned cached version of data");
        }
        return code >= 200 && (code < 300 || code == 304);
    }
}

class QuestalRequest {
    constructor(options, omitBody) {
        this._init(options, omitBody);
    }

    set success(fn) {
        if (typeof fn === 'function') {
            this._success = fn;
        }
    }

    get success() {
        if (!this.state == 'complete') {
            return false;
        }
        if (this._success && typeof this._success === 'function') {
            return this._success(this.response.code);
        } else {
            return this.response.isSuccess();
        }
    }

    set method(m) {
        m = m || '';
        this._method = m;
    }
    get method() {
        return this._method || null;
    }

    set url(url) {
        url =  url || '/';
        let urls = url.split('?');
        this._url = urls[0];
        if (urls.length > 1) {
            this.data.params = urls[1];
        }
    }

    get url() {
        return this._url || '/';
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
        let sendMethod = this.method.toUpperCase();
        this.settings.open(sendMethod, this.url);
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
            if ($this.success) {
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
                case 'responseHeaders': $this.events.fire('responseHeaders', $this.response.headers);
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

    _init(options, omitBody) {
        let $this = this;
        this.options = options || {};
        this.settings = new XMLHttpRequest();
        this.headers = new QuestalHeaders(this.settings);
        this.response = new QuestalResponse(this.settings, omitBody);
        this.events = new QuestalEvents(this.settings, this);
        this.eventNames = ['init', 'ready', 'responseHeaders', 'loadStart', 'change', 'complete', 'success', 'progress', 'abort', 'error', 'timeout'];
        this.data = new QuestalData();
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

class QuestalModule extends QuestalRequest {
    constructor(options, omitBody) {
        super(options, omitBody);
        this.state = 'unsent';
        this.chunks = '';
    }

    open() {
        let $this = this;
        this._presend(url, data);
        let sendMethod = this.method.toUpperCase();
        this.settings.method = sendMethod;
        this.settings.headers = this.headers.settings;
        this.events.fire('ready');
        this.request = this.protocol.request(this.url, this.settings, response => {
            $this.response = response;
            $this.events.fire('responseHeaders', response.headers);
            response.setEncoding($this.headers.encoding || 'utf8');
            
            response.on('data', chunk => {
               $this.events.fire('loadStart', chunk); 
               $this.chunks += chunk;
            });
            
            response.on('end', () => {
               if ($this.chunks) {
                   $this.events.fire('success', $this.chunks);
               } 
               $this.events.fire('complete');
            });
        });
        this.request.on('error', (err) => {
            $this.events.fire('error', err);
        });
        this.request.on('abort', () => {
           $this.events.fire('abort'); 
        });
        this.request.on('timeout', () => {
           $this.events.fire('timeout'); 
        });
        this.request.on('information', info => {
           $this.events.fire('progress', info); 
        });
        return this;
    }  
    
    send(body) {
        if (body) {
            this.request.write(body);
        }
        this.request.end();
    }
    
    set state(st) {
        if (['unsent', 'ready', 'responseHeaders', 'loadStart', 'complete'].includes(st)) {
            this._state = st;
        }
    }
    
    get state() {
      return this._state || 'unsent';   
    }
    
    get protocol() {
        if (!this.url) {
            return null;
        }
        let protocol = url.parse(this.url).protocol;
        if (protocol == 'http') {
            return http;
        }
        return https;
    }
    
    on(event, callback) {
        return this.events.on(event, callback);
    }
    
    off(event, callback) {
        this.events.off(event, callback);
    }
    
    onChange() {}
    
    _init() {
        this.options = options || {};
        this.events = new QuestalEvents(this);
        this.headers = new ModuleHeaders(this.options.headers || {});
        this.eventNames = ['init', 'ready', 'responseHeaders', 'loadStart', 'change', 'complete', 'success', 'progress', 'abort', 'error', 'timeout'];
        this.data = new QuestalData();
        this.url = this.options.url;
        this.method = this.options.method || 'get';
        this.data.params = this.options.data || this.options.params;
        this.set('timeout', this.options.timeout || 60000);
        this.onLoad();
        this.onReady();
        this.setOptions(this.options);
    }

    
    _defaultEvents() {
        this.on('error', ...errs => {
           echo('red', ...errs);
           process.exit(0);
        });
        this.on('ready', () => {
           this.state = 'ready'; 
           this.events.fire('change', 'ready');
        });
        this.on('responseHeaders', () => {
            this.state = 'responseHeaders'; 
            this.events.fire('change', 'responseHeaders');

        });
        this.on('loadStart', () => {
            this.state = 'loadStart'; 
            this.events.fire('change', 'loadStart');

        });
        this.on('complete', () => {
            this.state = 'complete'; 
            this.events.fire('change', 'complete');
        });
    }
    
    set settings(s) {
        let oldOptions = this.options;
        this.options = s;
        if (!this.options || typeof this.options !== 'object' || Array.isArray(this.options)) {
            this.options = oldOptions;
        }
    }
    
    get settings() {
        return this.options;
    }
}

class QuestalGet extends QuestalRequest {
    constructor(options) {
        super(options);
        this.success = this.response.success304;
    }

    get method() {
        return 'get';
    }
    set method(m) {

    }

    set url(url) {
        url =  url || '/';
        let urls = url.split('?');
        this._url = urls[0];
        if (urls.length > 1) {
            this.data.params = urls[1];
        }
    }

    get url() {
        if (this.data.params) {
            return this._url + '?' + this.data.params;
        } else {
            return this._url;
        }
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
        this.success = this.response.success304;
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

class QuestalDelete extends QuestalRequest {
    constructor(options) {
        super(options);
    }

    get method() {
        return 'delete';
    }
    set method(m) {

    }

    set url(url) {
        url =  url || '/';
        let urls = url.split('?');
        this._url = urls[0];
        if (urls.length > 1) {
            this.data.params = urls[1];
        }
    }

    get url() {
        if (this.data.params) {
            return this._url + '?' + this.data.params;
        } else {
            return this._url;
        }
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
            $this.headers.init();
        });
    }
}

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

export default Questal;