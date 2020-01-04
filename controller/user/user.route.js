const router = require('express').Router();
const clientDb = require('../../service/firestore-adapter');
const { UserModel, LoginUserModel } = require('./user.model');
const vldSchema = require('./user.validate');
const { ErrorMsg } = require('../../common/common.model');
const { ERROR_MSG } = require('../../common/constants/server-constant');


router.get('/profile', async (req, res) => {
    console.log(await db.get('user', {}));
});

router.post('/login', async (req, res) => {
    let result = await login(req.params, req.body)
    .catch(err => {
        res.status(err.code).send(err);
    });
    res.status(200).send(result);
    
});
async function login(params, body) {
    body = new LoginUserModel(body);
    body = mapBodyForQueryFilter(body)
    let errorValid = vldSchema.login.validate(body).error;
    if (!errorValid) {
        let result = await clientDb.Rest.get('user', body)
        .catch(_ => ERROR_MSG.SERVER_ERROR);

        if (result.data && result.data.length === 1) {
            return { data: result.data[0] };
        } else {
            throw new ErrorMsg(401, 'Ten dang nhap hoac mat khau khong dung');
        }
        
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
    
}

router.post('/register', async (req, res) => {
    let result = await register(req.params, req.body)
    .catch(err => {
        res.status(err.code).send(err);
    });
    res.status(200).send(result);
    
});
async function register(params, body) {
    body = new UserModel(body);
    let errorValid = vldSchema.register.validate(body).error;
    if (!errorValid) {
        await clientDb.AdminSDK.post('user', body)
        .catch(_ => ERROR_MSG.SERVER_ERROR)

        return { ok: 1 };
    } else {
        throw new ErrorMsg(400, errorValid.details[0].message);
    }
    
}

router.put('/update_profile', async (req, res) => {
    clientDb.AdminSDK.put('user', 'LhoobRrOG0MHLnxkEnna',  req.body)
    .then(data => {
        console.log(data);
        res.send(data.data);
    })
    .catch(console.log);
    
});
module.exports = router;