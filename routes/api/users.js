// Require needed modules
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, check, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const keys = require('../../config/keys');
const User = require('../../models/User');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/login', [
            check('email')
                .isLength({ min: 1 })
                .withMessage('Please enter your email')
                .isEmail()
                .withMessage('Please enter a valid email')
                .normalizeEmail(),
            check('password')
                .isLength({ min: 1 })
                .withMessage('Please enter your password')
                .escape()
        ], function(req,res,next) {

    User.authenticate(req.body.email, req.body.password, function(error, user) {

        // Handle incorrect credentials and any other errors
        // by creating error and forwarding it to error handler
        if (error || !user) {
            const err = new Error('Wrong email or password');
            err.status = 401;
            return next(err);
        } else { // Otherwise create jwt using creds

            // Create payload
            const payload = {
                id: user._id,
                name: user.name
            };

            // Sign token
            jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (error, token) => {
                res.json({
                    success: true,
                    token: "Bearer " + token
                });
            });
        }
    });
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
                    return true;
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
        res.status(400).json(errors.mapped());
    }
});

module.exports = router;
