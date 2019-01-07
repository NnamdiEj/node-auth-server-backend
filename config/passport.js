const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(email, password, next) {
        User.authenticate(email, password, function(error, user) {
            
        })
    }
))

const User = require('../models/User');
const keys = require('./keys');