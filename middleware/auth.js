const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 사용자 인증 미들웨어
const auth = async function (req, res, next) {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        var decoded = jwt.verify(token, process.env.SECRET_TOKEN);

        const user = await User.findOne({
            _id: decoded._id,
            email: decoded.email,
        });
        if (!user) {
            throw new Error('No user found');
        }
        req.token = token;
        req.user = user;

        next();
    } catch (e) {
        console.log(e);
        res.status(401).send('Invalid or Non-existing Token. Login First');
    }
};

module.exports = auth;
