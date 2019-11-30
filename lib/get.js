
const QuestalRequest = require('./request.js');

class QuestalGet extends QuestalRequest {
    constructor(options) {
        super(options);
    }

    get method() {
        return 'get';
    }
    set method(m) {

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