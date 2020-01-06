
const router = require('express').Router();
const clientDb = require('../../service/firestore-adapter');
const { checkAuth } = require('../../service/authentication');
const { BiddingSessionModel } = require('./bidding-session.model');
const vldSchema = require('./bidding-session.validate');
const { ErrorMsg } = require('../../common/common.model');
const { ERROR_MSG } = require('../../common/constants/server.constant');
const { mapBasicFilter } = require('../../common/helper');


router.get('/', async (req, res) => {
    let result = await getBiddingSession(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function getBiddingSession(params, body) {
    let result = await clientDb.Rest.get(
        'biddingsession', {}
    )
    .catch(_ => ERROR_MSG.SERVER_ERROR);
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
    let result = await clientDb.AdminSDK.get('biddingsession', params['id'])
    .catch(_ => ERROR_MSG.SERVER_ERROR);
    return {
        data: result.data
    }
}

router.post('/', async (req, res) => {
    let result = await postBiddingSession(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function postBiddingSession(params, body) {
    body = new BiddingSessionModel(body);
    let errorValid = vldSchema.postBiddingSession.validate(body).error;
    if (!errorValid) {
        await clientDb.AdminSDK.post('biddingsession', body)
        .catch(_ => ERROR_MSG.SERVER_ERROR)

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
        await clientDb.AdminSDK.put('biddingsession', params['id'], body)
        .catch(_ => ERROR_MSG.SERVER_ERROR)

        return { ok: 1 };
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
}

router.post('/createbidlog', checkAuth, async (req, res) => {

    let result = await createbidlog(req.middle.Auth, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function createbidlog(params, body) {
    body = new BiddingSessionModel(body);
    let errorValid = vldSchema.createbidlog.validate(body).error;
    if (!errorValid) {
        await clientDb.AdminSDK.post('biddingsession', body)
        .catch(_ => ERROR_MSG.SERVER_ERROR)

        return { ok: 1 };
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
}

module.exports = router;