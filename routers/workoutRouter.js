const express = require('express');
const router = express.Router();
const Workout = require('../models/workouts');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

// getting all or query of user's workout
// 사용자의 운동일지 호출
// GET/ /workouts/me?date_start=2022-01-01&date_end=2022-05-31
// GET/ /workouts/me?name=deadlift
// GET/ /workouts/me?dayofweek=TUES
// GET/ /workouts/me?routines=false
// GET/ /workouts/me?sort=date:desc
// GET/ /workouts/me?limit=2&skip=2
router.get('/workouts/me', auth, async (req, res) => {
    var user = req.user;
    var match = {};
    var select = '-todaysimage -password';
    var sort = {};

    if (req.query.name) {
        match.name = req.query.name;
    }
    if (req.query.dayofweek) {
        match.dayofweek = req.query.dayofweek;
    }
    if (req.query.date_start && req.query.date_end) {
        match.date = {
            $gte: new Date(req.query.date_start),
            $lte: new Date(req.query.date_end),
        };
    }
    if (req.query.sort) {
        [field, order] = req.query.sort.split(':');
        sort[field] = order;
    }
    select =
        req.query.routines === 'false' ? select.concat(' -exercises') : select;

    try {
        user = await user.populate({
            path: 'workouts',
            match,
            select,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            },
        });
        res.send(user);
    } catch (e) {
        res.status(404).send();
    }
});

// get specific workout
// 특정 운동 일지 호출
router.get('/workouts/me/:workoutId', auth, async (req, res) => {
    try {
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

// 이미지 추가를 위한 함수
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
// 새로운 운동 일지 생성
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

        await workout.save();
        res.status(201).send('workout updated');
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

// upate user workout
// 운동일지 업데이트
router.patch('/workouts/me/:workoutId', auth, async (req, res) => {
    try {
        const updateKeys = ['name', 'notes', 'date', 'dayofweek'];
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
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

// delete all workouts
// 전체 운동일지 삭제
router.delete('/workouts', async (req, res) => {
    try {
        const result = await Workout.deleteMany({});
        res.send(result);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

// delete user's all workouts
// 사용자의 전체 운동일지 삭제
router.delete('/workouts/me', auth, async (req, res) => {
    try {
        const result = await Workout.deleteMany({ owner: req.user._id });
        res.send(result);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

// delete user's specific workout by id
// 특정 운동일지 삭제
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

// get today's image
// 이미지 호출
router.get('/workouts/me/:workoutId/todaysimage', auth, async (req, res) => {
    try {
        var user = req.user;
        const workout = await Workout.findOne({
            _id: req.params.workoutId,
            owner: user._id,
        });
        if (!user || !workout) {
            return res.send('no user or no workout');
        }
        res.set('Content-Type', 'image/jpeg');
        res.send(workout.todaysimage);
    } catch (e) {
        console.log(e);
        res.status(404).send();
    }
});

// update today's image to workout by id
// 이미지 업데이트
router.patch(
    '/workouts/me/:workoutId/todaysimage',
    auth,
    upload.single('image'),
    async (req, res) => {
        try {
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
                return res.send('no workout found');
            }

            res.send('Todays Image updated');
        } catch (e) {
            console.log(e);
            res.status(500).send();
        }
    }
);

// delete today's image
// 이미지 삭제
router.delete('/workouts/me/:workoutId/todaysimage', auth, async (req, res) => {
    try {
        var user = req.user;
        const workout = await Workout.findOne({
            _id: req.params.workoutId,
            owner: user._id,
        });
        if (!workout) {
            return res.send('no workout found');
        }
        workout.todaysimage = undefined;
        await workout.save();
        res.send('deleted image');
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
});

// get user contribution graph by timestamp data
// 사용자의 운동 날짜만 호출
// GET/ /workouts/me?date_start=2022-01-01&date_end=2022-05-31
router.get('/workouts/contributions/me', auth, async (req, res) => {
    var user = req.user;
    var match = {};

    try {
        if (req.query.date_start && req.query.date_end) {
            match.date = {
                $gte: new Date(req.query.date_start),
                $lte: new Date(req.query.date_end),
            };
        }
        user = await user.populate({
            path: 'workouts',
            match,
            select: 'date -owner',
        });
        var workouts = user.workouts;

        if (workouts.length === 0) {
            return res.send('no user workouts');
        }

        workouts.sort((a, b) => {
            if (a.date < b.date) return -1;
            if (a.date > b.date) return 1;
            return 0;
        });
        res.send(workouts);
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
});

module.exports = router;
