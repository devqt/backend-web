const router = require('express').Router();
const db = require('../service/firestore-adapter');


router.get('/profile', async (req, res) => {
    console.log(await db.get('user', {}));
});

router.post('/login', (req, res) => {
    console.log();
    
});

router.post('/register', async (req, res) => {
    console.log(await db.post('user', {a: 1}).catch(console.log));
    
});

router.put('/update_profile', (req, res) => {
    console.log('getUser');
    
});
module.exports = router;