const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/todays-workout-api', {
	useNewURLParser: true,
});
