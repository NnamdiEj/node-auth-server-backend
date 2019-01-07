// Require needed modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Extract Schema Object
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', function(next) {
    const user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});

// Authentication function for user login
UserSchema.statics.authenticate = function(email, password, callback) {
    User.findOne({email: email})
        .exec(function(error, user) {
            if (error) {
                return callback(error);
            } else if (!user) {
                let err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function(error,result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        })
};

// Create user model and export
const User = mongoose.model('user', UserSchema);
module.exports = User;