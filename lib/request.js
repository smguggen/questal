module.exports = class {
    constructor() {
        this.sender = new XMLHttpRequest(); 
        this.events = new squire.Event();
        this.header = new squire.Header(this.sender);
        this.response = new squire.Response(this.sender);
        this.data = new squire.Data();
        this.onComplete();
    }
    
    set url(url) {
        if (!squire.Util.typecheck(url)) {
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
        this.data.data = data;
    }    
    get data() {
        return this.data.data;
    }
    get params() {
        return this.data.params;
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
    
    init(method, url, options) {
        options = options || {};
        let keys = Object.keys(options);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (this.events.eventNames.includes(key)) {
                this.on(key, option[key]);
            }
        }
        this.events.fire('init');
        this.set('timeout', options.timeout || 60000);
        let com = this.events.complete;
        let prog = this.events.progress;
        let ch = this.events.change;
        let err = this.events.error;
        let ab = this.events.abort;
        let time = this.events.timeout;
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
        this.events.fire('send');
        this.sender.send();
        return this;
    }
    
    onComplete() {
        let $this = this;
        this.on('complete', () => {
           if ($this.response.isSuccess()) {
               $this.events.fire('success');
           } 
        });
    }
}