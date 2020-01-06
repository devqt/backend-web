
class CategoryModel {
    name;
    constructor (entity) {
        entity = entity || {};
        this.name = entity.name;
    }
}

module.exports = { CategoryModel };