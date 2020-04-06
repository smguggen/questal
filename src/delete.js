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
        return this;
    }

    send(uri, params) {
        let { url, data } = this.presend(uri, params);
        super.open(url)
        return super.send(data);
    }

    _onReady() {
        let $this = this;
        this.on('ready', () => {
            $this.headers.init();
        });
    }
}

module.exports = QuestalDelete;