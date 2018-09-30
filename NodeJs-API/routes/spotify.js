var express = require('express');
var router = express.Router();
var Profile = require('../repositories/profileRepo');

// Get Homepage
router.get('/', function (req, res) {
    
    var token = req.auth;
    var userId = 'radu.stoica94';
    Profile.updateRecentlyPlayedSongs(userId, token.auth_token);
});

module.exports = router;
