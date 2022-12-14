const express = require('express');
require('./db/mongoose');
const app = express();
const port = process.env.PORT;
const userRouter = require('./routers/userRouter');
const workoutRouter = require('./routers/workoutRouter');
const routineRouter = require('./routers/routineRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRouter);
app.use(workoutRouter);
app.use(routineRouter);

app.listen(port, () => {
	console.log('listening on ' + port);
});

// to run jest
module.exports = app;
