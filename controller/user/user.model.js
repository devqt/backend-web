class User {
    user_id;
    password;
    email;
    name;
    address;
    constructor (entity) {
        entity || {};
        this.user_id = entity.user_id;
        this.password = entity.password;
        this.email = entity.email;
        this.name = entity.name;
        this.address = entity.address;
    }
}
module.exports = {User};