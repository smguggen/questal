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
        if (this.customExists) {
            this._fireCustom(event, detail, options);
        } else {
            console.warning("Event Details not available in this browser.")
           this.target.dispatchEvent(event);
        }
    }

    _fireCustom(event, detail, options) {
        options = options || {};
        this.target.dispatchEvent(new CustomEvent(event, {
            bubbles: options.bubbles || false,
            detail: detail || options.detail || null,
            cancelable: options.cancelable || false,
            composed: options.composed || false
        }));
    }
}

module.exports = QuestalEvents;