module.exports = class extends squire.Request {
    constructor() {
        super();
    }

    get method() {
        return 'get';
    }
    set method(m) {

    }

    init(url, options) {
        let $this = this;
        options = options || {};
        this.url = url;
        this.data = options.data || {};
        let query = this.params ? url + '?' + this.params : url;
        this.on('send', () => {
           let type = options.accept || ['plain', 'xml', 'html'];
           $this.header.accept = type;
           $this.header.init();
        });
        return super.init(this.method, query, options);
    }

    static get(url, data, options, settings) {
        let req = new squire.Get();
        return req.init(url, data, options, settings);
    }
}