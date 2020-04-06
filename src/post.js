const QuestalRequest = require('./request');

class QuestalPost extends QuestalRequest {
    constructor(options) {
        super(options);
        this.success = this.response.success304;
    }

    get method() {
        return 'post';
    }
    set method(m) {

    }

    open() {
        return this;
    }

    send(uri, params) {
        let { url, data } = this.presend(uri, params);
        super.open(url);
        return super.send(data);
    }

    onReady(options) {
        let $this = this;
        options = options || this.options;
        this.on('ready', () => {
            let type = options.accept || ['application/json'];
            $this.headers.accept = type;
            $this.headers.init();
        });
    }
}

module.exports = QuestalPost;