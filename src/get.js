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

    set url(url) {
        url =  url || '/';
        let urls = url.split('?');
        this._url = urls[0];
        if (urls.length > 1) {
            this.data.params = urls[1];
        }
    }

    get url() {
        if (this.data.params) {
            return this._url + '?' + this.data.params;
        } else {
            return this._url;
        }
    }

    open() {
        return null;
    }

    send(url, data) {
        super.open(url, data)
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
}

module.exports = QuestalGet;