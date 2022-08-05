const express = require('express');
const router = express.Router();
const Workout = require('../models/workouts');
const auth = require('../middleware/auth');

// 1. test getting all tasks
// 2. test relationship with user
// 3. put in auth middleware

// getting all tasks. not specific to user
router.get('/workouts', async (req, res) => {
	try {
		const tasks = await Workout.find({});
		res.send(tasks);
	} catch (e) {
		res.status(400).send();
	}
});

//getting user specific task
router.get('/workouts/me', auth, async (req, res) => {
	var user = req.user;
	try {
		user = await user.populate({ path: 'workouts' });
		res.send(user);
	} catch (e) {
		res.status(400).send();
	}
});

router.post('/workouts', auth, async (req, res) => {
	try {
		const workout = new Workout({
			...req.body,
			owner: req.user._id,
		});
		await workout.save();
		res.send(workout);
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
});

router.delete('/workouts', async (req, res) => {
	try {
		const result = await Workout.deleteMany({});
		res.send(result);
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
});

module.exports = router;
