const QuestalHeaders = require('../src/headers.js');
const QuestalResponse = require('../src/response.js');
const QuestalData = require('../src/data.js');
const QuestalEvents = require('../src/events.js');

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

module.exports = QuestalRequest;