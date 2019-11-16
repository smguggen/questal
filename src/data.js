module.exports = class {
    constructor() {
        
    }
    
    set data(data) {
        this.setData(data);
    }
    set params(params) {
        this.setData(params);
    }
    get data() {
        return this._data || {};
    }
    get params() {
        return this._params || '';
    }
    
    setData(info) {
        if (!this._data) {
            this._data = {};
        }
        if (!this._params) {
            this._params = '';
        }
        let data = {},
        params = '',
        type = squire.Util.getType(info);
        if (type == 'object') {
            data = info;
            params = this.parseParamsToString(info);
        } else if (type == 'string') {
            data = this.parseParamsToObject(info);
            params = info;
        }
        
        this._data = Object.assign({}, this._data, data);
        this._params += params;
    }
    
    parseParamsToObject(str) {
        str = str || '';
        if (str.substring(0,1) == '?') {
            str = str.substring(1);
        }
        return str.split('&').reduce((acc, param) => {
            let parts = param.split('=');
            acc[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
            return acc;
        }, {});
    }
    
    parseParamsToString(obj, withMark) {
        obj = obj || {};
        let data = withMark ? '?' : '';
        let str = Object.keys(obj).reduce((acc, param) => {
            acc += encodeURIComponent(params) + '=' + encodeURIComponent(obj[param]);
            return acc;
        }, '').join('&');
        return data + str;
    }
}