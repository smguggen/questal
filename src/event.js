module.exports = class {
    constructor(events) {
        events = events || [];
        this.eventNames = ['init', 'send', 'change', 'complete', 'success', 'progress', 'abort', 'error', 'timeout'].concat(events);
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
    
    fire(event) {
        let $this = this;
        if (!this.events[event] || !this.events[event].length) {
            return;
        }
        let ev = this.events[event];
        for (let i = 0; i < ev.length; i++) {
            let fn = ev[i];
            fn.call($this);
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
    
    get complete() {
        return this._getTemplate('complete')
    }
    
    get change() {
        return this._getTemplate('change')
    }
    
    get progress() {
       return  this._getTemplate('progress');
    }
    
    get error() {
        return this._getTemplate('error');
    }
    
    get abort() {
        return this._getTemplate('abort');
    }
    
    get success() {
        return this._getTemplate('success');
    }
    
    get init() {
        return this._getTemplate('init');
    }
    
    get timeout() {
        return this._getTemplate('timeout');
    }
    
    _getTemplate(event) {
        let $this = this;
        if (this.eventNames.includes(event) && this.events[event] && this.events[event].length) {
            return () => {
                $this.fire(event);
            }
        } else {
            return false;
        }
    }
}