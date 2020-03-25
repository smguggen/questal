const QuestalUtil = require('./util');
const QuestalResponse = require('./response');
const { IncomingMessage } = require('http');
class ModuleResponse extends QuestalResponse {
    constructor(response, data, omitBody) {
        super(response, omitBody);
        this.settings = response;
        this.types = ['document', 'text', 'json', 'other'];
        this.responseData = data || '';
    }
    
    get headers() {
        if (!this.active) {
            return {};
        }
        let res = this.settings.headers;
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
    
    get url() {
        return this.settings.url;
    }
    
    set type(type) {
        
    }
    get type() {
        let type = this.headers.contentType;
        if (!type) {
            return this.defaultType;
        }
        switch(type) {
            case 'text/plain': return 'text';
            break;
            case 'application/json': return 'json';
            break;
            case 'text/html': return 'document';
            break;
        }
        return 'other';
    }
    
    get result() {
        return this.responseData;
    }
    
    get xml() {
        return this.responseData;
    }
    
    get html() {
        return this.responseData;
    }
    
    get status() {
        return this.settings.statusMessage;
    }
    
    get code() {
        return this.settings.statusCode;
    }
}

module.exports = ModuleResponse;