module.exports = class {
    constructor(events) {
        events = events || [];
        this.eventNames = events;
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

    fire(event, ...params) {
        let $this = this;
        params = params && params.length ? params : null;

        if (!this.events[event] || !this.events[event].length) {
            return;
        }
        let ev = this.events[event];
        for (let i = 0; i < ev.length; i++) {
            let fn = ev[i];
            if (params) {
                fn.apply($this, params);
            } else {
                fn.call($this);
            }
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

    add(event) {
        if (!Array.isArray(event)) {
            event = [event];
        }
        let $this = this;
        event.forEach((ev) => {
            $this.event = ev;
        });
    }

    schedule(event, ...params) {
        let $this = this;
        if (this.eventNames.includes(event) && this.events[event] && this.events[event].length) {
            return (...args) => {
                args = args.concat(params);
                $this.fire(event, ...args);
            }
        } else {
            return false;
        }
    }
}