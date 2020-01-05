
class UserModel {
    user_id;
    password;
    email;
    name;
    address;
    constructor (entity) {
        entity = entity || {};
        this.user_id = entity.user_id;
        this.password = entity.password;
        this.email = entity.email;
        this.name = entity.name;
        this.address = entity.address;
    }
}

class LoginUserModel {
    user_id;
    password;
    constructor (entity) {
        entity = entity || {};
        this.user_id = entity.user_id;
        this.password = entity.password;
    }
}

class ResponseUserModel {
    user_id;
    email;
    name;
    address;
    constructor (entity) {
        entity = entity || {};
        this.user_id = entity.user_id;
        this.email = entity.email;
        this.name = entity.name;
        this.address = entity.address;
    }
}
module.exports = { UserModel, LoginUserModel, ResponseUserModel };