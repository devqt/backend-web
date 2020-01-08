
const router = require('express').Router();
const { FieldValue } = require('firebase-admin').firestore;
const { AdminDbRef } = require('../../service/firestore');
const clientDb = require('../../service/firestore-adapter');
const { checkAuth } = require('../../service/authentication');
const { BiddingSessionModel, BidLogModel, ResultBidLogModel } = require('./bidding-session.model');
const vldSchema = require('./bidding-session.validate');
const { ErrorMsg } = require('../../common/common.model');
const { ERROR_MSG } = require('../../common/constants/server.constant');


router.get('/', async (req, res) => {
    let result = await getBiddingSession(req.query, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function getBiddingSession(query, body) {
    let result = await clientDb.Rest.get(
        'bidding_session', {}
    )
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    result.data = result.data && result.data.filter(e => {
        let condition = true;
        for (let key in query) {
            if (key === 'itemname') {
                condition = condition && e[key].includes(query[key]);
                continue;
            }
            condition = condition && e[key] === query[key];
        }
        return condition;
    });
    return {
        data: result.data
    }
}

router.get('/:id', async (req, res) => {
    let result = await getBiddingSessionByID(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function getBiddingSessionByID(params, body) {
    let result = await clientDb.AdminSDK.get('bidding_session', params['id'])
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    return {
        data: result.data[0]
    }
}

router.post('/', checkAuth, async (req, res) => {
    let result = await postBiddingSession(req.params, req.middleAuth.userInfo['_id'], req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function postBiddingSession(params, userid, body) {
    let errorValid = vldSchema.postBiddingSession.validate(body).error;
    if (!errorValid) {
        let [userResult, categoryResult] = await Promise.all(
            clientDb.AdminSDK.get('user', userid, {
                select: ['_id', 'user_id', 'name']
            }),
            clientDb.AdminSDK.get('category', userid, {
                select: ['_id', 'name']
            }),
        )
        .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
        if (!userResult.data[0]) {
            throw new ErrorMsg(403, 'Nguoi dung khong ton tai');
        }
        if (!categoryResult.data[0]) {
            throw new ErrorMsg(403, 'Loai mat hang khong ton tai');
        }

        await clientDb.AdminSDK.post('bidding_session', new BiddingSessionModel({
            ...body, 
            'user': userResult.data[0],
            'category': categoryResult.data[0],
        }))
        .catch(_ => {throw ERROR_MSG.SERVER_ERROR})

        return { ok: 1 };
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
}

router.put('/:id', async (req, res) => {
    let result = await putBiddingSession(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function putBiddingSession(params, body) {
    body = new BiddingSessionModel(body);
    let errorValid = vldSchema.putBiddingSession.validate(body).error;
    if (!errorValid) {  
        await clientDb.AdminSDK.put('bidding_session', params['id'], body)
        .catch(_ => {throw ERROR_MSG.SERVER_ERROR})

        return { ok: 1 };
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
}

router.get('/bidlog/currentuser', checkAuth, async (req, res) => {
    let result = await getBidLog(req.middleAuth.userInfo['_id'])
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function getBidLog(userid) {
    let result = await clientDb.Rest.get('bidding_session', {
        where: {
            'biddinglog_userid': { $contain: userid}
        }
    })
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    let bidLogAr;
    if (result.data) {
        bidLogAr = [];
        result.data.forEach(_session => {
            for (let _bidlog of _session['biddinglog']) {
                if (_bidlog['userid'] === userid) {
                    bidLogAr.push({..._bidlog, 'biddingsession': _session})
                }
            }
        });
    }
    return {
        data: bidLogAr && bidLogAr.map(e => new ResultBidLogModel(e))
    }
}

router.post('/:id/bidlog', checkAuth, async (req, res) => {

    let result = await createbidlog(req.params, req.middleAuth.userInfo['_id'], req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function createbidlog(params, userid, body) {
    body['biddate'] = new Date().toISOString();
    body = new BidLogModel(body);
    let errorValid = vldSchema.createbidlog.validate(body).error;
    if (errorValid) {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }

    let userResult = await clientDb.AdminSDK.get('user', userid, {
        select: ['_id', 'user_id', 'name']
    })
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    if (!userResult.data[0]) {
        throw new ErrorMsg(403, 'Nguoi dung khong ton tai');
    }

    /** update document field */
    docRef = clientDb.getDocRef('bidding_session', params['id']);
    await AdminDbRef.runTransaction(t => {
        return t.get(docRef).then(doc => {
            doc = doc.data();
            doc['biddinglog'] = doc['biddinglog'] || [];
            doc['biddinglog_userid'] = doc['biddinglog_userid'] || [];
            let currentbid = doc['biddinglog'].reduce((a, e) => {
                if (e['bidamount'] > a) return e['bidamount'];
                return a;
            }, body['bidamount']);

            clientDb.AdminSDK.putWithTransaction(t, 'bidding_session', params['id'], {
                'biddinglog': doc['biddinglog'].concat({...body, 'user': userResult.data[0]}),
                'biddinglog_userid': doc['biddinglog_userid'].concat(userid),
                'currentbid': currentbid
            });
        })
    })
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});

    /** transaction udpate reference */
    await AdminDbRef.runTransaction(t => {
        return t.get(docRef).then(async doc => {
            doc = doc.data();
            let wishListResult = await clientDb.Rest.get('wish_list', {
                where : {
                    'biddingsession_id': { $contain: params['id'] }
                }
            })
            .catch(_ => { throw ERROR_MSG.SERVER_ERROR });
            if (wishListResult.data) {
                wishListResult.data.forEach(element => {
                    let biddingSessionDoc = (element['biddingsession'] || []).find(e => e['_id'] === params['id']);
                    clientDb.AdminSDK.putWithTransaction(t, 'wish_list', element['_id'], {
                        'biddingsession': FieldValue.arrayRemove(biddingSessionDoc),
                        'biddingsession': FieldValue.arrayUnion(doc),
                    });
                })
                
            }
        })
    })
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
}

module.exports = router;