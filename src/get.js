const QuestalRequest = require('./request');

class QuestalGet extends QuestalRequest {
    constructor(options) {
        super(options);
        this.success = this.response.success304;
    }

    get method() {
        return 'get';
    }
    set method(m) {

    }

    open() {
        return null;
    }

    send(uri, params) {
        let { url, data } = this.presend(uri, params);
        url = this.setQueryString(url, data);
        super.open(url)
        super.send();
    }

    _onReady(options) {
        let $this = this;
        this.on('ready', () => {
            let type = options.accept || ['plain', 'xml', 'html'];
            $this.headers.accept = type;
            $this.headers.init();
        });
    }
    
    setQueryString(url, data) {
        url = url || this.url;
        let urls = url.split('?');
        let q1 = urls[1];
        let q2 = this.data.params;
        let q3 = '';
        if (data) {
            if (typeof data !== 'string') {
                data = this.data.parseParamsToString(data);
            }
            q3 = data;
        }
        let params = '';
        if (q1 || q2 || q3) {
            params = '?' + ([q1, q2, q3].filter(q => q ? true : false).join('&'));
        }
        return urls[0] + params;
    }
}

module.exports = QuestalGet;