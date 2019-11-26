module.exports = class extends QuestalRequest {
    constructor() {
        super();
    }

    get method() {
        return 'get';
    }
    set method(m) {

    }

    send(url, options) {
        let $this = this;
        options = options || {};
        this.url = url;
        this.data = options.data || {};
        let query = this.params ? url + '?' + this.params : url;
        this.init(this.method, query, options);
        super.send();
    }

    _onReady(options) {
        let $this = this;
        this.on('ready', () => {
            let type = options.accept || ['plain', 'xml', 'html'];
            $this.header.accept = type;
            $this.header.init();
        });
    }
}