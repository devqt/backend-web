
class ErrorMsg {
    code;
    message;
    constructor (code, message) {
        this.code = code || 0;
        this.message = message || '';
    }
    
}
module.exports = { ErrorMsg };