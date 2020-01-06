
class BiddingSessionModel {
    itemname;
    categoriesid;
    itemdescription;
    startdate;
    enddate;
    startprice;
    minimumincreasebid;
    imagelink;
    itemcondition;
    constructor (entity) {
        entity = entity || {};
        this.itemname = entity.itemname;
        this.categoriesid = entity.categoriesid;
        this.itemdescription = entity.itemdescription;
        this.startdate = entity.startdate;
        this.enddate = entity.enddate;
        this.startprice = entity.startprice;
        this.minimumincreasebid = entity.minimumincreasebid;
        this.imagelink = entity.imagelink;
        this.itemcondition = entity.itemcondition;
    }
}

module.exports = { BiddingSessionModel };