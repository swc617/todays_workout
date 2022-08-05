const mongoose = require('mongoose');
const { Schema, Model } = mongoose;

const workoutSchema = new Schema({
	name: {},
	dayofweek: {
		enum: [mon, tues, wed, thurs, fri],
	},
});
