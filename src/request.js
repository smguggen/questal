const QuestalHeaders = require('../lib/headers');
const QuestalResponse = require('../lib/response');
const QuestalEvents = require('../lib/events');
const { ProtoRequest } = require('@srcer/questal-proto')
class QuestalRequest extends ProtoRequest {
    constructor(options, omitBody) {
        let settings = new XMLHttpRequest();
        super(settings, options, omitBody);
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
    get state() {
        let st = this.settings.readyState;
        let arr = ['unsent', 'ready', 'responseHeaders', 'loadStart', 'complete'];
        return arr[st];
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
        if (this.events && typeof this.events.on === 'function') {
            this.events.on(event, callback);
        }
        return this;
    }

    off(event, callback) {
        if (this.events && typeof this.events.off === 'function') {
            this.events.off(event, callback);
        }
        return this;
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
        this.headers = new QuestalHeaders(this.settings);
        this.response = new QuestalResponse(this.settings, omitBody);
        this.events = new QuestalEvents(this.settings, this);
        this.eventNames = ['init', 'ready', 'responseHeaders', 'loadStart', 'change', 'complete', 'success', 'progress', 'abort', 'error', 'timeout'];
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
}

module.exports = QuestalRequest;