const JWT = require('jsonwebtoken');
module.exports = {
    authentication: (req, res, next) => {
        const authorization = req.headers.authorization;

        const tokens = authorization.split('Bearer ');
        const token = tokens[1];
        if (!token) {
            return res.json({success: false, msg: 'Token required'})
        }
        let data;
        try {
            data = JWT.verify(token, 'mySecret'); 
        } catch (error) {
            return res.json({success: false, msg: 'authentication failed'})
        }
        req.user = data.user;
        return next();
    }
}
