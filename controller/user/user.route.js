const router = require('express').Router();
const clientDb = require('../../service/firestore-adapter');
const { User } = require('./user.model');


router.get('/profile', async (req, res) => {
    console.log(await db.get('user', {}));
});

router.post('/login', (req, res) => {
    console.log();
});

router.post('/register', async (req, res) => {
    let result = await register(req.params, req.body)
    .catch(err => {
        res.status(err.status).send(err.message);
    });
    res.status(200).send(result);
    
});
async function register(params, body) {
    body = new User(body);
    let data = await clientDb.AdminSDK.post('user', body)
    .catch(_ => ({
        status: 500,
        message: 'Server Error.'
    }));
    return {ok: 1};
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