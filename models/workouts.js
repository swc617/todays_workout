const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const Routine = require('./routine');
// const , User } = require('./user');

const workoutSchema = new Schema(
	{
		owner: {
			type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
			required: true,
		},
		name: {
			type: String,
		},
		notes: {
			type: String,
		},
		dayofweek: {
			type: String,
			enum: ['MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT', 'SUN'],
		},
		exercises: [Routine.schema],
	},
	{
		timestamps: true,
	}
);

// workoutSchema.pre('save', async function (next) {
// 	const workout = this;
// 	next();
// });

const Workout = model('Workout', workoutSchema);

module.exports = Workout;
