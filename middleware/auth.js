const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async function (req, res, next) {
	// console.log(req.headers.authorization);
	const token = req.headers.authorization.replace('Bearer ', '');
	try {
		var decoded = jwt.verify(token, process.env.SECRET_TOKEN);
		// console.log(decoded);
	} catch (e) {
		res.status(401).send('Invalid Token');
	}
	const user = await User.findOne({ _id: decoded._id, email: decoded.email });
	if (!user) {
		throw new Error('No user found');
	}
	req.token = token;
	req.user = user;

	next();
};

module.exports = auth;
