const CONFIG = require('./common/server-constant')
const express = require('express');

const userController = require('./controller/user');
const bLogController = require('./controller/bidding-session');

const app = express();

app.use('/users', userController);
// app.use('sessions', bLogController);

app.listen(CONFIG.PORT || 3000, CONFIG.HOST || '127.0.0.1', () => {
    console.log('Running...');
    
});