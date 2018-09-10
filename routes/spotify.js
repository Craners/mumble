var express = require('express');
var router = express.Router();
var Song = require('../models/Song');

// Get Homepage
router.get('/spotify2', function (req, res) {

    console.log(req);
    var a = Song.getSongs(req);
    // Beer.ShowAllBeers(function(callback) {
    // 		res.render('index',{beers:a,beers2:callback});
    // });
});