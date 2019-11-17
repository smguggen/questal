module.exports = class extends squire.Request {
    constructor() {
        super();
    }
    
    get method() {
        return 'post';
    }
    set method(m) {
        
    }
    
    init(url, data, options, settings) {
        let $this = this;
        this.url = url;
        this.data = data || options || {};
        options = options || {};
        this.send(() => {
           let type = options.accept || ['application/json'];
           $this.accept(type);
        });
        return super.init(this.method, this.url, options, settings);
    }
    
}