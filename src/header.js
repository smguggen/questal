module.exports = class {
    constructor(sender) {
        this.sender = sender;
        this.headers = {};
    }
    
    set accept(type) {
        if (!this._accept) {
            this._accept = [];
        }
        let res;
        switch(type) {
            case 'json': res = 'application/json';
            break;
            case 'html':res = 'text/html';
            break;
            case 'xml': res = 'application/xml, application/xhtml+xml';
            break;
            case 'plain': res = 'text/plain';
            break;
            default: res = type;
            break;
        }
        if (res == '*/*') {
          this._accept = ['*/*'];  
        } else if (!this._accept.includes(res)) {
            this._accept.push(res);
        }
    }
    get accept() {
        if (!this._accept) {
            this._accept = [];
        }
        if (this._accept.includes('*/*')) {
            return '*/*';
        } else {
            return this._accept.join(',');
        }
    }
    
    set encoding(type) {
        let $this = this;
        switch(type) {
            case 'multipart': $this.encoding = 'multipart/form-data';
            case 'form':
            break;
            case 'plain': $this.encoding = 'text/plain';
            break;
            default:$this.encoding = 'application/x-www-form-urlencoded';
            break;
        }
    }
    get encoding() {
        if (!this._encoding) {
            return 'application/x-www-form-urlencoded';
        } else {
            return this._encoding;
        }
    }
    
    set(key, value) {
         if (key.toLowerCase() == 'accept') {
                this.accept = value;
            } else if (key == 'encoding' || key == 'Content-Type') {
                this.encoding = value;
            } else if (!this.isForbidden(key)) {
                this.headers[key] = value;
            }
        return this;
    }
    
    init() {
        let keys = Object.keys(this.headers);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = this.headers[key];
            if (!this.isForbidden(key)) {
                this.sender.setRequestHeader(key, value);
            }
            if (this.accept) {
                this.sender.setRequestHeader('Accept', this.accept);
            }
            if (this.encoding) {
                this.sender.setRequestHeader('Content-Type', this.encoding);
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
}