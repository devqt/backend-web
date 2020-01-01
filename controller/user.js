const router = require('express').Router();
const db = require('../service/firestore-adapter');


router.get('/profile', async (req, res) => {
    console.log(await db.get('', {from: ['user']}).catch(console.error));
});

router.post('/login', (req, res) => {
    console.log('getUser');
    
});

router.post('/register', (req, res) => {
    console.log('getUser');
    
});

router.put('/update_profile', (req, res) => {
    console.log('getUser');
    
});
module.exports = router;