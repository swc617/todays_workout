const express = require('express');
const User = require('../models/user');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// create new user
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

// login user
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.authenticateUser(
			req.body.email,
			req.body.password
		);
		const token = await user.generateToken(user._id, user.email);
		res.send(user);
	} catch (e) {
		res.status(401).send();
	}
});

// logout user
router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.token = '';
		await req.user.save();
		res.send('Logout Successful');
	} catch (e) {
		res.status(404).send(e);
	}
});

// get user profile
router.get('/users/profile/me', auth, async (req, res) => {
	try {
		var user = req.user;
		res.send(user);
	} catch (e) {
		console.log(e);
		res.status(404).send(e);
	}
});

// update user name
router.patch('/users/profile/me', auth, async (req, res) => {
	try {
		const updateKeys = ['name', 'age', 'weight', 'height'];
		const isValid = Object.keys(req.body).every((key) =>
			updateKeys.includes(key)
		);

		if (!isValid) {
			return res.status(400).send('Invalid Key');
		}

		const result = await User.findOneAndUpdate(
			{ _id: req.user._id },
			{ ...req.body }
		);

		// to update bmi using middleware
		var user = await User.findOne({ _id: req.user._id });
		await user.save();
		res.send(user);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

// delete user by id and cascade delete workouts
router.delete('/users/profile/me', auth, async (req, res) => {
	try {
		const result = await User.findOneAndDelete({ _id: req.user._id });
		res.send(result);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

// delete all users
router.delete('/users', async (req, res) => {
	try {
		const result = await User.deleteMany({});
		res.send('delete count: ' + result.deletedCount);
	} catch (e) {
		console.log(e);
		res.status(500).send(e);
	}
});

module.exports = router;
