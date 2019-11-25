const QuestalHeader = require('../src/header.js');
const QuestalResponse = require('../src/header.js');
const QuestalData = require('../src/data.js');
const QuestalUtil = require('../src/util.js');

module.exports = class {
    constructor() {
        this.sender = new XMLHttpRequest();
        this.events = ['init', 'ready', 'responseHeaders', 'loadStart', 'change', 'complete', 'success', 'progress', 'abort', 'error', 'timeout'];
        this.header = new QuestalHeader(this.sender);
        this.response = new QuestalResponse(this.sender);
        this._data = new QuestalData();
        this._setEvents();
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
        let $this = this;
        this.sender.addEventListener(event, function(event) {
            let detail = event.detail || $this.sender;
            callback.call($this, detail, event);
        });
    }

    fire(event, detail, options) {
        options = options || {};
        this.sender.dispatchEvent(new CustomEvent(event, {
            bubbles: options.bubbles || false,
            detail: detail || options.detail || null,
            cancelable: options.cancelable || false,
            composed: options.composed || false
        }));
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
            if (this.events.includes(key)) {
                this.on(key, options[key]);
            }
        }
        this.fire('init');
        this.set('timeout', options.timeout || 60000);
        this.sender.open(method, url);
        return this;
    }

    send(body) {
        body = body || null;
        this.sender.send(body);
    }

    _onChange() {
        let $this = this;
        this.on('readystatechange', () =>{
            switch($this.type) {
                case 'ready': $this.fire('ready');
                break;
                case 'responseHeaders': $this.fire('responseHeaders', $this.header);
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
        this.on('load', (event) => {
           if ($this.response.isSuccess()) {
               $this.fire('success', $this.response);
           }
        });
    }

    _setEvents() {
        this.schedule('load', 'complete', this.response);
        this.schedule('readystatechange', 'change');
        this._onChange();
        this._onReady();
        this._onComplete();
    }

    schedule(event, alias, details) {
        let $this = this;
        this.on(event, function() {
            $this.fire(alias, details);
        });
    }
}