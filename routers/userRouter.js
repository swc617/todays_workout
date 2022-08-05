const express = require('express');
const User = require('../models/user');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

router.get('/users', async (req, res) => {
	try {
		const users = await User.find({});
		res.send(users);
	} catch (e) {
		res.send(e);
	}
});

router.post('/users/register', async (req, res) => {
	try {
		const user = new User(req.body);
		await user.save();
		res.status(201).send(user);
	} catch (e) {
		console.log(e);
		res.status(500).send(e);
	}
});

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.authenticateUser(
			req.body.email,
			req.body.password
		);
		user.token = await user.generateToken(user._id, user.email);
		res.send(user);
	} catch (e) {
		res.status(400).send(e);
	}
});

router.get('/users/profile/me', auth, async (req, res) => {
	const user = req.user;
	res.send(user);
});

router.delete('/users', async (req, res) => {
	try {
		const result = await User.deleteMany({});
		res.send('delete count: ' + result.deletedCount);
	} catch (e) {
		console.log(e);
		res.send(e);
	}
});

module.exports = router;
