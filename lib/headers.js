const { ProtoHeaders } = require('@srcer/questal-proto');
class QuestalHeaders extends ProtoHeaders {
    constructor(request) {
        super();
        this.settings = request;
        this.headers = {};
    }

    init() {
        if (this.sendable) {
            let keys = Object.keys(this.headers);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let value = this.headers[key];
                if (!this.isForbidden(key)) {
                    this.settings.setRequestHeader(key, value);
                }
            }
            if (this.accept) {
                this.settings.setRequestHeader('Accept', this.accept);
            }
            if (this.encoding) {
                this.settings.setRequestHeader('Content-Type', this.encoding);
            }
        }
        return this;
    }

    isForbidden(key) {
       key = key.trim();
       if (key.startsWith('Sec-') || key.startsWith('Proxy-')) {
           return true;
       }
       let forbidden = ['Accept-Charset','Accept-Encoding','Access-Control-Request-Headers','Access-Control-Request-Method','Connection','Content-Length','Cookie','Cookie2','Date','DNT','Expect','Host','Keep-Alive','Origin','Referer','TE','Trailer','Transfer-Encoding','Upgrade','Via'];
       if (forbidden.includes(key)) {
           return true;
       }
       return false;
    }

    sendable() {
        if (this.settings.readyState >= 2) {
            return false;
        } else {
            return true;
        }
    }
}
 
module.exports = QuestalHeaders;