const express = require('express');
const router = express.Router();
const Workout = require('../models/workouts');
const Routine = require('../models/routine');
const auth = require('../middleware/auth');

// get specific exercise
// 특정 운동 루틴 호출
router.get('/routines/:workoutId/:routineId', auth, async (req, res) => {
    try {
        const workout = await Workout.findOne({
            _id: req.params.workoutId,
            owner: req.user._id,
        });
        if (!workout) {
            return res.send('No Workout!');
        }
        const exercises = workout.exercises.id(req.params.routineId);
        res.send(exercises);
    } catch (e) {
        console.log(e);
        res.status(404).send();
    }
});

// create routine
// 운동 루틴 생성
router.post('/routines/:workoutId', auth, async (req, res) => {
    try {
        const workout = await Workout.findOne({
            _id: req.params.workoutId,
            owner: req.user._id,
        });
        if (!workout) {
            return res.send('No Workout!');
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

// upate user workout
// 운동 루틴 업데이트
router.patch('/routines/:workoutId/:routineId', auth, async (req, res) => {
    try {
        const updateKeys = ['name', 'sets', 'reps', 'weight'];
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
                    'exercises.$.reps': req.body.weight,
                },
            }
        );
        res.send('routine updated');
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

// delete all routines
// 전체 운동 루틴 삭제
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
        res.send('all routine deleted');
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

// delete routine by id
// 특정 운동 루틴 삭제
router.delete('/routines/:workoutId/:routineId', auth, async (req, res) => {
    try {
        const workout = await Workout.findOne({
            _id: req.params.workoutId,
            owner: req.user._id,
        });
        if (!workout) {
            return res.send('No Workout!');
        }
        const result = workout.exercises.id(req.params.routineId).remove();
        await workout.save();
        res.send('routine deleted');
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

module.exports = router;
