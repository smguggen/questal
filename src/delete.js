const QuestalRequest = require('./request');

class QuestalDelete extends QuestalRequest {
    constructor(options) {
        super(options);
    }

    get method() {
        return 'delete';
    }
    set method(m) {

    }

    open() {
        return null;
    }

    send(uri, params) {
        let { url, data } = this.presend(uri, params);
        super.open(url)
        super.send(data);
    }

    _onReady() {
        let $this = this;
        this.on('ready', () => {
            $this.headers.init();
        });
    }
}

module.exports = QuestalDelete;