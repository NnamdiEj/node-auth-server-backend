// Require needed modules
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { check, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const keys = require('../config/keys');
const User = require('../../models/User');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/register', [
            check('name')
                .isLength({ min: 1 })
                .withMessage('Please enter your name')
                .trim()
                .escape(),
            check('email')
                .isLength({ min: 1 })
                .withMessage('Please enter your email address')
                .isEmail()
                .withMessage('Please enter a valid email address')
                .normalizeEmail()
                .trim()
                .escape(),
            check('password')
                .isLength({ min: 1 })
                .withMessage('Please enter your password')
                .escape(),
            check('passwordConfirmation')
                .isLength({ min: 1 })
                .withMessage('Please repeat your password')
                .custom((value, { req }) => {
                    if (value !== req.body.password) {
                        throw new Error('Passwords do not match');
                    }
                })
                .escape()
        ], function(req,res,next) {

    // Ensure valid form submission
    const errors = validationResult(req);
    if (errors.isEmpty()) {

        //  Create user data object used to add field to MongoDB "User" collection
        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };

        // Add new user to MongoDB "User" collection
        User.create(userData, function(error, user) {
            if (error) { // Forward any errors to error handlers
                return next(error);
            } else { // Save user id and redirect to home route
                res.json(user);
            }
        });

    } else { // Invalid form submission
        const err = new Error('All fields required');
        err.status = 400;
        return next(err);
    }
});

module.exports = router;
