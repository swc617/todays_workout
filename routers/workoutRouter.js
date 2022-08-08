const express = require('express');
const router = express.Router();
const Workout = require('../models/workouts');
const User = require('../models/user');
const auth = require('../middleware/auth');

// getting all tasks. not specific to user
router.get('/workouts', async (req, res) => {
	try {
		const workouts = await Workout.find({});
		res.send(worktouts);
	} catch (e) {
		res.status(400).send();
	}
});

//getting user specific workout
router.get('/workouts/me', auth, async (req, res) => {
	var user = req.user;
	try {
		user = await user.populate({ path: 'workouts' });
		res.send(user);
	} catch (e) {
		res.status(400).send();
	}
});

// create user workout
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

//upate user workout
router.patch('/workouts/me/:workoutId', auth, async (req, res) => {
	try {
		const updateKeys = ['name', 'notes', 'dayofweek'];
		const isValid = Object.keys(req.body).every((key) =>
			updateKeys.includes(key)
		);

		if (!isValid) {
			return res.status(400).send('Invalid Key');
		}

		const result = await Workout.findOneAndUpdate(
			{ _id: req.params.workoutId, owner: req.user._id },
			{ ...req.body },
			{ returnDocument: 'after' }
		);
		res.send(result);
	} catch (e) {}
});

// delete all workouts
router.delete('/workouts', async (req, res) => {
	try {
		const result = await Workout.deleteMany({});
		res.send(result);
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
});

// delete users all workouts
router.delete('/workouts/me', auth, async (req, res) => {
	try {
		const result = await Workout.deleteMany({ owner: req.user._id });
		res.send(result);
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
});

router.delete('/workouts/me/:workoutId', auth, async (req, res) => {
	try {
		const deleted = await Workout.findOneAndDelete({
			owner: req.user._id,
			_id: req.params.workoutId,
		});
		res.send(deleted);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

// get user contribution graph by timestamp data
router.get('/workouts/me/contributions', auth, async (req, res) => {
	try {
		var user = req.user;

		user = await user.populate({ path: 'workouts', select: 'createdAt' });

		if (!user.workouts.length) {
			res.send('No Workouts!');
		} else {
			var contributions = user.workouts.map((workout) => {
				return {
					_id: workout._id,
					workout_date: workout.createdAt,
				};
			});
			res.send(contributions);
		}
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
});

module.exports = router;
