const mongoose = require('mongoose');
const { Schema, model } = mongoose;
// const , User } = require('./user');

const workoutSchema = new Schema(
	{
		owner: {
			type: Schema.Types.ObjectId,
			reuired: true,
			ref: 'User',
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
		exercises: [
			{
				routine: {
					name: {
						type: String,
					},
					sets: {
						type: Number,
					},
					reps: {
						type: Number,
					},
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

const Workout = model('Workout', workoutSchema);

module.exports = Workout;
