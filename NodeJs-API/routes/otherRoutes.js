var express = require('express');
var router = express.Router();
var Profile = require('../repositories/profileRepo');

// Get Homepage
router.get('/', function (req, res) {

    res.send("Page not found");
    res.end();
});

module.exports = router;
