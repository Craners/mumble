var express = require('express');
var router = express.Router();
var Profile = require('../repositories/profileRepo');
var ProfileSchema = require('../models/Profile');


// Get Homepage
router.get('/', function (req, res) {

    var animal = req.auth;
    Profile.getProfile(animal.auth_token).then((something) => {

        ProfileSchema = something;
        if (ProfileSchema.result === true) {

            res.send('Welcome back! ' + ProfileSchema.name);
        }
        else {

            res.send('Welcome ' + ProfileSchema.name + ', You were registered as a new user');
        }
        return {'something':'something'};
        // res.end();
    });
});

module.exports = router;
