const QuestalHeaders = require('../lib/headers');

class ModuleHeaders extends QuestalHeaders {
    constructor(options) {
        super(options);
    }
    
    sendable() {
        return true;
    }
    
    init() {
        let keys = Object.keys(this.headers);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = this.headers[key];
            if (!this.isForbidden(key)) {
                this.settings[key] = value;
            }
        }
        if (this.accept) {
            this.settings['Accept'] = this.accept;
        }
        if (this.encoding) {
            this.settings['Content-Type'] = this.encoding;
        }
        return this;
    }
}

module.exports = ModuleHeaders;