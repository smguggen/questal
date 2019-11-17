const _squireEvents = require('../src/events.js');
const _squireHeader = require('../src/header.js');
const _squireResponse = require('../src/header.js');
const _squireData = require('../src/data.js');
const _squireUtil = require('../src/util.js');

module.exports = class {
    constructor() {
        this.sender = new XMLHttpRequest();
        this.events = new _squireEvents(['init', 'send', 'change', 'complete', 'success', 'progress', 'abort', 'error', 'timeout']);
        this.header = new _squireHeader(this.sender);
        this.response = new _squireResponse(this.sender);
        this._data = new _squireData();
        this.onComplete();
    }

    set url(url) {
        if (!_squireUtil.typecheck(url)) {
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
        this.events.fire('send', this.sender);
        this.sender.send();
        return this;
    }

    onComplete() {
        let $this = this;
        this.on('complete', (event) => {
           if ($this.response.isSuccess()) {
               $this.events.fire('success', [$this.response, event]);
           }
        });
    }
}