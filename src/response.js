module.exports = class {
    constructor(sender) {
        this.sender = sender;
        this.defaultType = 'text';
        this.types = ['arraybuffer', 'blob', 'document', 'text', 'json'];
    }

    get data() {
        let oldType = this.type;
        this.type = 'json';
        let res = this.sender.response;
        this.type = oldType;
        return res;
    }

    get url() {
        return this.sender.responseURL;
    }

    get result() {
        return this.sender.responseText;
    }

    get json() {
        let res = this.result
        try {
            return JSON.parse(res);
        } catch(e) {
            return res;
        }
    }

    get xml() {
        return this.sender.responseXML;
    }
    get html() {
        if (this.type == 'document') {
            return this.sender.responseXML;
        } else {
            return '';
        }
    }

    set type(type) {
        type = type == 'buffer' ? 'arraybuffer' : type;
        if (this.types.includes(type)) {
            this._type = type;
            this.sender.responseType = type;
        }
    }
    get type() {
        return this._type || this.defaultType;
    }

    get status() {
        return this.sender.statusText;
    }

    get code() {
        return this.sender.status;
    }

    isSuccess() {
        return this.code >= 200 && this.code < 300;
    }



}