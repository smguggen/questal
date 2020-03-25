
const QuestalRequest = require('../src/request');
const QuestalEvents = require('@srcer/events');
const ModuleHeaders = require('../lib/module-headers');
const QuestalData = require('../lib/data');
const ModuleResponse = require('../lib/module-response');

const { echo } = require('ternal');

const url = require('url');
const http = require('http');
const https = require('https');

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
            $this.events.fire('responseHeaders', response.headers);
            response.setEncoding($this.headers.encoding || 'utf8');
            
            response.on('data', chunk => {
               $this.events.fire('loadStart', chunk); 
               $this.chunks += chunk;
            });
            
            response.on('end', () => {
                $this.response = new ModuleResponse(response, $this.chunks, $this.omitBody);
               if ($this.chunks) {
                   $this.events.fire('success', $this.response);
               } 
               $this.events.fire('complete', $this.response);
            });
        });
        if (this.settings.timeout) {
            this.request.setTimeout(this.settings.timeout, () => {
               $this.events.fire('timeout'); 
            });
        }
        this.request.on('error', (err) => {
            $this.events.fire('error', err);
        });
        this.request.on('abort', () => {
           $this.events.fire('abort'); 
        });
        this.request.on('information', info => {
           $this.events.fire('progress', info); 
        });
        return this;
    }  
    
    send(body) {
        if (body) {
            let data;
            do {
                data = this.request.write(body)
            } while (data);
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
    
    _init(options, omitBody) {
        this.options = options || {};
        this.omitBody = omitBody;
        this.events = new QuestalEvents(this);
        //TODO - fix this
        this.response = {};
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



module.exports = QuestalModule;