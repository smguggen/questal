module.exports = class extends QuestalRequest {
    constructor() {
        super();
    }

    get method() {
        return 'post';
    }
    set method(m) {

    }

   send(url, data, options, settings) {
        this.url = url;
        this.data = data || options || {};
        options = options || {};
        this.init(this.method, this.url, options, settings);
        super.send(this.params);
    }

    _onReady(options) {
        let $this = this;
        this.on('ready', () => {
            let type = options.accept || ['application/json'];
            $this.header.accept = type;
            $this.header.init();
        });
    }

}