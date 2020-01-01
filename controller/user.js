const router = require('express').Router();
const coreDB = require('../service/core-api');


router.get('/profile', async (req, res) => {
    console.log(await coreDB.get('', {from: ['user']}).catch(console.error));
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