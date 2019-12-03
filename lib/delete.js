
const QuestalRequest = require('./request.js');

class QuestalDelete extends QuestalRequest {
    constructor(options) {
        super(options);
    }

    get method() {
        return 'delete';
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
            $this.headers.init();
        });
    }
}

module.exports = QuestalDelete;