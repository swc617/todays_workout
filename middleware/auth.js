const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async function (req, res, next) {
	// console.log(req.headers.authorization);

	try {
		const token = req.headers.authorization.replace('Bearer ', '');
		var decoded = jwt.verify(token, process.env.SECRET_TOKEN);
		// console.log(token);

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
		// console.log(e.name);
		console.log(e);
		res.status(401).send('Invalid or Non-existing Token. Login First');
	}
};

module.exports = auth;
