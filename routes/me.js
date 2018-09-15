var express = require('express');
var router = express.Router();
var Profile = require('../models/Profile');

// Get Homepage
router.get('/', function (req, res) {

    // console.log(req);
    // console.log('hey');
    var animal = req.auth;
    // res.send(animal.auth_token + ' says ' + animal.says);
    Profile.getProfile(animal.auth_token);
    // var a = Profile.getProfile(req);
    // Beer.ShowAllBeers(function(callback) {
    // 		res.render('index',{beers:a,beers2:callback});
    // });
});

module.exports = router;
