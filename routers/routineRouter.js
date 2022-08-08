const express = require('express');
const router = express.Router();
const Workout = require('../models/workouts');
const Routine = require('../models/routine');
const auth = require('../middleware/auth');

// get all routines not specific to user
router.get('/allroutines', async (req, res) => {
	try {
		const workouts = await Workout.find({}, 'exercises');
		var allRoutines = [];
		workouts.forEach((workout) => {
			allRoutines = allRoutines.concat(workout.exercises);
		});
		res.send(allRoutines);
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
});

// get specific workout
router.get('/routines/:workoutId', auth, async (req, res) => {
	try {
		// console.log(req.params);
		const workout = await Workout.findOne({
			_id: req.params.workoutId,
			owner: req.user._id,
		});
		if (!workout) {
			res.send('No Workout!');
		} else {
			res.send(workout);
		}
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
});

// get specific exercise
router.get('/routines/:workoutId/:routineId', auth, async (req, res) => {
	try {
		const workout = await Workout.findOne({
			_id: req.params.workoutId,
			owner: req.user._id,
		});
		if (!workout) {
			res.send('No Workout!');
		}
		const exercises = workout.exercises.id(req.params.routineId);
		res.send(exercises);
	} catch (e) {
		console.log(e);
		res.status(400).send();
	}
});

// create routine
router.post('/routines/:workoutId', auth, async (req, res) => {
	try {
		const workout = await Workout.findOne({
			_id: req.params.workoutId,
			owner: req.user._id,
		});
		if (!workout) {
			res.send('No Workout!');
		}
		const routine = new Routine(req.body);
		workout.exercises.push(routine);
		await workout.save();
		res.status(201).send(routine);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

//upate user workout
router.patch('/routines/:workoutId/:routineId', auth, async (req, res) => {
	try {
		const updateKeys = ['name', 'sets', 'reps'];
		const isValid = Object.keys(req.body).every((key) =>
			updateKeys.includes(key)
		);

		if (!isValid) {
			return res.status(400).send('Invalid Key');
		}

		const workout = await Workout.findOneAndUpdate(
			{
				_id: req.params.workoutId,
				owner: req.user._id,
				'exercises._id': req.params.routineId,
			},
			{
				$set: {
					'exercises.$.name': req.body.name,
					'exercises.$.sets': req.body.sets,
					'exercises.$.reps': req.body.reps,
				},
			},
			{ returnDocument: 'after' }
		);

		// var exercise = workout.exercises.id(req.params.routineId);
		// exercise.name = req.body.name;
		// exercise.name = req.body.name;
		// exercise.name = req.body.name;
		res.send(workout);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

// delete all routines
router.delete('/routines/:workoutId', auth, async (req, res) => {
	try {
		const workout = await Workout.updateOne(
			{
				_id: req.params.workoutId,
				owner: req.user._id,
			},
			{
				$set: { exercises: [] },
			}
		);
		res.send(workout);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

// delete routine by id
router.delete('/routines/:workoutId/:routineId', auth, async (req, res) => {
	try {
		const workout = await Workout.findOne({
			_id: req.params.workoutId,
			owner: req.user._id,
		});
		if (!workout) {
			res.send('No Workout!');
		}
		const result = workout.exercises.id(req.params.routineId).remove();
		await workout.save();
		res.send(result);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

module.exports = router;
