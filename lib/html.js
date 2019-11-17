module.exports = class extends squire.Get {
    constructor() {
        super();
    }

    init(url, options) {
        let $this = this;
        options.accept = 'html';
        this.on('send', () => {
           $this.response.type = 'document';
        });
        return super.init(this.method, url, options);
    }

    static html(url, data, options, settings) {
        let req = new squire.Html();
        return req.init(url, data, options, settings);
    }
}