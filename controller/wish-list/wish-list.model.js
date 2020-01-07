
let { BiddingSessionModel } = require('../bidding-session/bidding-session.model');
class WishListModel {
    user;
    createddate;
    biddingsession;
    constructor (entity) {
        entity = entity || {};
        this.user = entity.user;
        this.createddate = entity.createddate;
        this.biddingsession = entity.biddingsession;
        // this.biddingsession = new BiddingSessionModel(entity.biddingsession);
    }
}

module.exports = { WishListModel };