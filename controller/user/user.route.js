
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const clientDb = require('../../service/firestore-adapter');
const { checkAuth } = require('../../service/authentication');
const { UserModel, LoginUserModel, ResponseUserModel, UpdateUserModel } = require('./user.model');
const vldSchema = require('./user.validate');
const { ErrorMsg } = require('../../common/common.model');
const { ERROR_MSG, SECRET_KEY } = require('../../common/constants/server.constant');
const { mapBasicFilter } = require('../../common/helper');


router.post('/login', async (req, res) => {
    let result = await login(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function login(params, body) {
    body = new LoginUserModel(body);
    let errorValid = vldSchema.login.validate(body).error;
    if (!errorValid) {
        let result = await clientDb.Rest.get(
            'user', {
                where: mapBasicFilter(body)
            }
        )
        .catch(_ => {throw ERROR_MSG.SERVER_ERROR});

        if (Array.isArray(result.data) && result.data.length === 1) {
            let token = jwt.sign(
                {
                    user_id: result.data[0]['user_id'],
                    _id: result.data[0]['_id'],
                },
                SECRET_KEY, 
                {
                    expiresIn: '1d'
                }
            );
            return { data : {token} };
        } else {
            throw new ErrorMsg(401, 'Ten dang nhap hoac mat khau khong dung');
        }
        
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
}

router.get('/profile', checkAuth, async (req, res) => {
    let result = await profile(req.middleAuth.userInfo)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
});
async function profile(userInfo) {
    let result = await clientDb.AdminSDK.get('user', userInfo['_id'], {
        select: Object.keys(new ResponseUserModel())
    })
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});

    if (result.data) {
        return { data: result.data[0] };
    } else {
        throw new ErrorMsg(401, 'Loi khi xac thuc nguoi dung.');
    }
}

router.get('/:id', async (req, res) => {
    let result = await getById(req.params['id'])
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
});
async function getById(userid) {
    let result = await clientDb.AdminSDK.get('user', userid, {
        select: Object.keys(new ResponseUserModel())
    })
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    return { data: result.data && result.data[0] };
}

router.post('/register', async (req, res) => {
    let result = await register(req.params, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
async function register(params, body) {
    body = new UserModel(body);
    let errorValid = vldSchema.register.validate(body).error;
    if (!errorValid) {
        let result = await clientDb.Rest.get(
            'user', {
                where: mapBasicFilter({
                    user_id: body['user_id']
                })
            }
        )
        .catch(_ => {throw ERROR_MSG.SERVER_ERROR});

        if (Array.isArray(result.data) && result.data.length === 1) {
            throw new ErrorMsg(400, 'Ten dang nhap da ton tai.');
        } else {
            await clientDb.AdminSDK.post('user', {
                ...body,
                'wallet': 50000000,
                'vpoint': 0,
                ...!body['name'] && { 'name': body['user_id'] }
            })
            .catch(_ => {throw ERROR_MSG.SERVER_ERROR})

            return { ok: 1 };
        }
        
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
    
}

router.put('/update_profile', checkAuth, async (req, res) => {
    let result = await update_profile(req.middleAuth.userInfo._id, req.body)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
});
async function update_profile(userid, body) {
    await clientDb.AdminSDK.put('user', userid, new UpdateUserModel(body))
    .catch(_ => {throw ERROR_MSG.SERVER_ERROR});
    return {
        ok: 1
    }
}

router.post('/init', async (req, res) => {
    let result = await clientDb.AdminSDK.batchPost(req.body.collection, req.body.data)
    .catch(err => {
        res.status(err.code || 500).send(err);
    });
    res.status(200).send(result);
    
});
module.exports = router;