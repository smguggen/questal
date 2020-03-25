const QuestalUtil = require('./util');
const QuestalResponse = require('./response');

class ModuleResponse extends QuestalResponse {
    constructor(request, omitBody) {
        super(request, omitBody);
    }
    
    integrate(request) {
        this.settings = request;
        return this;
    }
}

module.exports = ModuleResponse;