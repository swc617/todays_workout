const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Schema, model } = mongoose;

const validator = require('validator');

const userSchema = new Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email invalid');
			}
		},
	},
	password: {
		type: String,
		minLength: 8,
		trim: true,
		validate(value) {
			if (!validator.isStrongPassword(value)) {
				throw new Error('Password must be strong!');
			}
		},
	},
	name: {
		type: String,
		required: true,
	},
	token: {
		type: String,
	},
});

userSchema.statics.authenticateUser = async function (email, password) {
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error('User not Found');
	}
	const pwdMatch = await bcrypt.compare(password, user.password);
	if (!pwdMatch) {
		throw new Error('Invalid password');
	}
	return user;
};

userSchema.methods.generateToken = async function (id, email) {
	const token = await jwt.sign(
		{ _id: id, email: email },
		process.env.SECRET_TOKEN
	);
	return token;
};

userSchema.pre('save', async function (next) {
	const user = this;

	if (user.$isNew) {
		user.password = await bcrypt.hash(user.password, 10);
	}

	next();
});

const User = model('User', userSchema);

module.exports = User;
