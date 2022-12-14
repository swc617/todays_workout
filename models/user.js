const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Schema, model } = mongoose;
const Workout = require('./workouts');

const validator = require('validator');

// 유저 스키마와 모델
const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email invalid');
            }
        },
    },
    password: {
        type: String,
        minLength: 8,
        trim: true,
        select: false,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error('Password must be strong!');
            }
        },
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 50,
    },
    age: {
        type: Number,
        required: true,
        minLength: 1,
        maxLength: 3,
    },
    weight: {
        type: Number,
        min: 30,
        max: 500,
    },
    height: {
        type: Number,
        min: 120,
        max: 300,
    },
    bmi: {
        type: Number,
    },
    token: {
        type: String,
    },
});

// 운동일지와 관계
userSchema.virtual('workouts', {
    ref: 'Workout',
    localField: '_id',
    foreignField: 'owner',
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

// 사용자 인증 메소드
userSchema.statics.authenticateUser = async function (email, password) {
    const user = await User.findOne({ email }).select('+password').exec();

    if (!user) {
        throw new Error('User not Found');
    }
    // 해시 비교
    const pwdMatch = await bcrypt.compare(password, user.password);
    if (!pwdMatch) {
        throw new Error('Invalid password');
    }
    return user;
};

// 사용자 토큰 생성 메소드
userSchema.methods.generateToken = async function (id, email) {
    // jwt 토큰 생성
    const token = await jwt.sign(
        { _id: id, email: email },
        process.env.SECRET_TOKEN
    );
    user = this;
    user.token = token;
    await user.save();

    return token;
};

// 사용자가 입력한 몸무게와 키를 이용한 bmi 계산 메소드
userSchema.methods.calculateBmi = function (weight, height) {
    user = this;
    var bmi = user.weight / (user.height / 100) ** 2;
    user.bmi = Math.round(bmi * 10) / 10;
};

// 사용자 저장하기전에 bcrypt 암호화
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.$isNew) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    user.calculateBmi(user.weight, user.height);

    next();
});

// 사용자를 삭제할 때 운동일지 전체 같이 삭제
userSchema.pre('findOneAndDelete', async function (next) {
    const user = this;

    await Workout.deleteMany({ owner: user._id });

    next();
});

const User = model('User', userSchema);

module.exports = User;
