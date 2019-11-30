class QuestalResponse {
    constructor(request) {
        this.settings = request;
        this.defaultType = 'text';
        this.types = ['arraybuffer', 'blob', 'document', 'text', 'json'];
    }

    get headers() {
        let res = this.settings.getAllResponseHeaders();
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
        let res = this.settings.response;
        this.type = oldType;
        return res;
    }

    get url() {
        return this.settings.responseURL;
    }

    get result() {
        if (['', 'text'].includes(this.type)) {
            return this.settings.responseText;
        } else {
            return this.settings.response;
        }
    }

    get json() {
        let res = this.result
        try {
            let json = JSON.parse(res);
            return typeof json === 'string' ? JSON.parse(json) : json;
        } catch(e) {
            return res;
        }
    }

    get xml() {
        return this.settings.responseXML;
    }
    get html() {
        if (this.type == 'document') {
            return this.settings.responseXML;
        } else {
            return '';
        }
    }

    set type(type) {
        type = type == 'buffer' ? 'arraybuffer' : type;
        if (this.types.includes(type) && this.settings.readyState < 2) {
                this.settings.responseType = type;
        } else {
            console.assert(false, 'Can\'t set ' + type + '. Headers already sent');
        }
    }
    get type() {
        return this.settings.responseType;
    }

    get status() {
        return this.settings.statusText;
    }

    get code() {
        return this.settings.status;
    }

    isSuccess() {
        let code = this.code;
        if (code == 304) {
            console.warn("Response Code 304: Server returned cached version of data");
        }
        return code >= 200 && (code < 300 || code == 304);
    }
}

module.exports = QuestalResponse;