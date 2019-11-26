module.exports = class extends QuestalRequest {
    constructor(options) {
        super(options);
    }

    get method() {
        return 'post';
    }
    set method(m) {

    }

    open() {
        return null;
    }

    send(url, data) {
        super.open(url, data);
        super.send(this.data.params);
    }

    onReady(options) {
        let $this = this;
        this.on('ready', () => {
            let type = options.accept || ['application/json'];
            $this.header.accept = type;
            $this.header.init();
        });
    }

}