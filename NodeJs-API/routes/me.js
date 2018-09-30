var express = require('express');
var router = express.Router();
var Profile = require('../repositories/profileRepo');

// Get Homepage
router.get('/', function (req, res) {

    var animal = req.auth;    
    Profile.getProfile(animal.auth_token);
});

module.exports = router;
