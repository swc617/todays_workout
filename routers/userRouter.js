const express = require('express');
const User = require('../models/user');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// TEST purpose - get all users
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
		const token = await user.generateToken(user._id, user.email);
		res.send(user);
	} catch (e) {
		res.status(400).send();
	}
});

router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.token = '';
		await req.user.save();
		res.send('Logout Successful');
	} catch (e) {
		res.status(400).send(e);
	}
});

router.get('/users/profile/me', auth, async (req, res) => {
	try {
		var user = req.user;
		res.send(user);
	} catch (e) {
		console.log(e);
		res.status(400).send(e);
	}
});

router.patch('/users/profile/me', auth, async (req, res) => {
	try {
		if (!Object.keys(req.body).includes('name')) {
			res.send('User can only update name');
		}
		const result = await User.findOneAndUpdate(
			{ _id: req.user._id },
			{ name: req.body.name },
			{ returnDocument: 'after' }
		);
		res.send(result);
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
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
