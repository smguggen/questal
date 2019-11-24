module.exports = class {
    constructor(sender) {
        this.sender = sender;
        this.defaultType = 'text';
        this.types = ['arraybuffer', 'blob', 'document', 'text', 'json'];
    }

    get headers() {
        let res = this.sender.getAllResponseHeaders();
        let result = {};
        if (res) {
            result = res.split('\r\n').reduce((acc, header) => {
                let parts = header.split(':');
                if (parts && parts.length == 2) {
                    let key = QuestalUtil.toCamelCase(parts[0]);
                    if (['contentType', 'cacheControl'].includes(key)) {
                        let separator = key == 'contentType' ? ';' : ',';
                        let sets = parts[1].split(separator);
                        let val = sets[0].trim();
                        acc[key] = val;
                        if (key == 'contentType') {
                            acc.encoding = val.split('/')[1];
                        }
                        if (sets.length > 1) {
                            let params = sets[1].split('=');
                            if (params.length > 1) {
                                let param = QuestalUtil.toCamelCase(params[0]);
                                acc[param] = params[1].trim();
                            }
                        }
                    } else {
                        acc[key] = parts[1].trim();
                    }
                }
                return acc;
            }, {});
        }
        if (this.type) {
            result.responseType = this.type;
        }
        return result;
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
        if (this.types.includes(type) && this.sender.readyState < 2) {
                this.sender.responseType = type;
        } else {
            console.log('Headers already sent');
        }
    }
    get type() {
        return this.sender.responseType;
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