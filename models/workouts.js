const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const Routine = require('./routine');

const dateDict = {
	0: 'SUN',
	1: 'MON',
	2: 'TUES',
	3: 'WED',
	4: 'THURS',
	5: 'FRI',
	6: 'SAT',
};

const workoutSchema = new Schema({
	owner: {
		type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		required: true,
	},
	name: {
		type: String,
		trim: true,
		required: true,
	},
	notes: {
		type: String,
		trim: true,
		maxLength: 100,
		default: 'none',
	},
	date: {
		type: Date,
		default: new Date(),
	},
	dayofweek: {
		type: String,
		default: dateDict[new Date().getDay()],
		enum: ['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'],
	},
	todaysimage: {
		type: Buffer,
	},
	exercises: [Routine.schema],
});

const Workout = model('Workout', workoutSchema);

module.exports = Workout;
