
const router = require('express').Router();
const { FieldValue } = require('firebase-admin').firestore;
const clientDb = require('../../service/firestore-adapter');
const { checkAuth } = require('../../service/authentication');
const { WishListModel } = require('./wish-list.model');
const vldSchema = require('./wish-list.validate');
const { ErrorMsg } = require('../../common/common.model');
const { ERROR_MSG } = require('../../common/constants/server.constant');
const { mapBasicFilter } = require('../../common/helper');


router.get('/', async (req, res) => {
    let result = await getWishList(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function getWishList(params, body) {
    let result = await clientDb.Rest.get(
        'wish_list', {}
    )
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    result.data = result.data && result.data.filter(e => {
        let condition = true;
        for (let key in query) {
            if (key === 'name') {
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
    let result = await getWishListByID(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function getWishListByID(params, body) {
    let result = await clientDb.AdminSDK.get('wish_list', params['id'])
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    return {
        data: result.data[0]
    }
}

router.get('/all/currentuser', checkAuth, async (req, res) => {
    let result = await getWishlist(req.middleAuth.userInfo['_id'])
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function getWishlist(userid) {
    let result = await clientDb.Rest.get('wish_list', {
        where: {
            'user._id': { $eq: userid }
        }
    })
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    let responseData;
    if (result.data) responseData = result.data[0] && result.data[0]['biddingsession'];
    return {
        data: responseData
    }
}

router.post('/', checkAuth, async (req, res) => {
    let result = await postWishList(req.params, req.middleAuth.userInfo['_id'], req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function postWishList(params, userid, body) {
    body['createddate'] = new Date().toISOString();
    let errorValid = vldSchema.postWishList.validate(body).error;
    if (!errorValid) {
        let [userResult, biddingSResult] = await Promise.all([
            clientDb.AdminSDK.get('user', userid, {
                select: ['_id', 'user_id', 'name']
            }),
            clientDb.AdminSDK.get('bidding_session', body['sessionid'], {})
        ])
        .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
        if (!userResult.data[0]) {
            throw new ErrorMsg(403, 'Nguoi dung khong ton tai');
        }
        if (!biddingSResult.data[0]) {
            throw new ErrorMsg(403, 'Phien dau gia khong ton tai');
        }

        let wishListResult = await clientDb.Rest.get('wish_list', {
            where: {
                'user._id': { $eq: userid }
            }
        })
        .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
        body = new WishListModel(body);
        if (!wishListResult.data) {
            await clientDb.AdminSDK.post('wish_list', {
                ...body, 
                'user': userResult.data[0],
                'biddingsession': biddingSResult.data,
                'biddingsession_id': [biddingSResult.data[0]['_id']],
            })
            .catch(_ => {throw ERROR_MSG.SERVER_ERROR});

            return { ok: 1 };
        } else {
            await clientDb.AdminSDK.put('wish_list', wishListResult.data[0]['_id'], {
                'biddingsession': FieldValue.arrayUnion(biddingSResult.data[0]),
                'biddingsession_id': FieldValue.arrayUnion(biddingSResult.data[0]['_id']),
            })
        }
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
}

router.put('/:id', async (req, res) => {
    let result = await putWishList(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function putWishList(params, body) {
    body = new WishListModel(body);
    let errorValid = vldSchema.putWishList.validate(body).error;
    if (!errorValid) {  
        await clientDb.AdminSDK.put('wish_list', params['id'], body)
        .catch(_ => {throw ERROR_MSG.SERVER_ERROR})

        return { ok: 1 };
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
}

module.exports = router;