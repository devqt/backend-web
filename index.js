const {PORT, HOST} = require('./common/server-constant');
const bodyParser = require('body-parser');
const express = require('express');

const userController = require('./controller/user/user.route');
const bLogController = require('./controller/bidding-session/route');

const app = express();
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/users', userController);
// app.use('sessions', bLogController);

app.listen(PORT || 3000, HOST || '127.0.0.1', () => {
    console.log('Running...');
    
});