const {PORT, HOST} = require('./common/server-constant')
// const {PORT, HOST} = {}
const express = require('express');

const userController = require('./controller/user');
const bLogController = require('./controller/bidding-session');

const app = express();

app.use('/users', userController);
// app.use('sessions', bLogController);

app.listen(PORT || 3000, HOST || '127.0.0.1', () => {
    console.log('Running...');
    
});