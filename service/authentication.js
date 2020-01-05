
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../common/constants/server.constant');

module.exports.checkAuth = function (req, res, next) {
    jwt.verify(req.headers['authorization'], SECRET_KEY, async (err, payload) => {
        if (err) {
            res.status(401).send('Auth failed.');
            return;
        }
        req.middleAuth = {
            userInfo: payload
        }
        next();
    })
    
}