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

module.exports = QuestalEvents;