const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// 루틴 스키마와 모델
const routineSchema = new Schema({
    name: {
        type: String,
    },
    sets: {
        type: Number,
    },
    reps: {
        type: Number,
    },
    weight: {
        type: Number,
        default: 0,
    },
});

const Routine = model('Routine', routineSchema);

module.exports = Routine;
