const express = require('express');
const router = express.Router();
const Workout = require('../models/workouts');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

// TEST purpose - getting all tasks. not specific to user
router.get('/workouts', async (req, res) => {
	try {
		const workouts = await Workout.find({});
		res.send(worktouts);
	} catch (e) {
		res.status(400).send();
	}
});

// getting user specific workout
router.get('/workouts/me', auth, async (req, res) => {
	var user = req.user;
	try {
		user = await user.populate({
			path: 'workouts',
			// TEST purpose - removing this line will lag postman formatting buffer data
			select: '-todaysimage',
		});
		res.send(user);
	} catch (e) {
		res.status(400).send();
	}
});

const upload = multer({
	limits: { fileSize: 10000000 },
	fileFilter: (req, file, cb) => {
		const mimetype = file.mimetype;
		if (
			!(
				mimetype === 'image/jpeg' ||
				mimetype === 'image/jpg' ||
				mimetype === 'image/png'
			)
		) {
			cb(null, false);
		}

		cb(null, true);
	},
});

// create user workout
router.post('/workouts', auth, upload.single('image'), async (req, res) => {
	try {
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 300, height: 300 })
			.jpeg()
			.toBuffer();
		const workout = new Workout({
			...req.body,
			todaysimage: buffer,
			owner: req.user._id,
		});

		// console.log(workout._id);
		await workout.save();
		//TEST - sending id and exercises for postman environment
		res.status(201).send([workout._id, workout.exercises]);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

// get today's image
router.get('/workouts/me/:workoutId/todaysimage', auth, async (req, res) => {
	try {
		var user = req.user;
		const workout = await Workout.findOne({
			_id: req.params.workoutId,
			owner: user._id,
		});
		if (!user || !workout) {
			throw new Error('no user or no workout');
		}
		res.set('Content-Type', 'image/jpeg');
		// console.log(workout);
		// console.log()
		res.send(workout.todaysimage);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

// update today's image to workout by id
router.patch(
	'/workouts/me/:workoutId/todaysimage',
	auth,
	upload.single('image'),
	async (req, res) => {
		try {
			// console.log(req.file);
			// console.log(req.params.workoutId);
			const buffer = await sharp(req.file.buffer)
				.resize({ width: 300, height: 300 })
				.jpeg()
				.toBuffer();

			const workout = await Workout.findOneAndUpdate(
				{
					_id: req.params.workoutId,
					owner: req.user._id,
				},
				{
					todaysimage: buffer,
				}
			);
			if (!workout) {
				throw new Error('no workout found');
			}

			res.send('Todays Image updated');
		} catch (e) {
			console.log(e);
			res.status(500).send();
		}
	}
);

// delete today's image
router.delete('/workouts/me/:workoutId/todaysimage', auth, async (req, res) => {
	try {
		var user = req.user;
		const workout = await Workout.findOne({
			_id: req.params.workoutId,
			owner: user._id,
		});

		workout.todaysimage = undefined;
		await workout.save();
		res.send('deleted image');
	} catch (e) {
		console.log(e);
		res.status(500).send();
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
		res.send('details updated');
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
