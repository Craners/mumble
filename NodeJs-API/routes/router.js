var express = require('express');
var router = express.Router();
var path = require('path');
let querystring = require('querystring');
let request = require('request');
var Profile = require('../repositories/profileRepo');
var ProfileSchema = require('../models/Profile');
var session = require('express-session');
var CronJob = require('cron').CronJob;

let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8888/callback';

//Middleware that is specific to this router
router.use(function timeLog(req, res, next) {

    console.log('request code: ' + res.statusCode);
    console.log('request url: ' + req.url);
    console.log('request date: ' + new Date().toUTCString());
    next();
});

// Define the home page route
router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '../../index.html'));
});
// router.use(express.static(path.join(__dirname, '../../assets')));

router.get('/login', function (req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: 'user-read-private user-read-email user-read-recently-played user-top-read',
            redirect_uri
        }))
})

router.get('/callback', function (req, res) {
    let code = req.query.code || null
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'))
        },
        json: true
    }
    request.post(authOptions, function (error, response, body) {

        auth_token = body.access_token;

        req.session.refresh_token = body.refresh_token;
        req.session.auth_token = auth_token;
        req.session.loggedin = true;

        res.redirect('/me');
    })
});

var startCronJob = function (refresh_token, callback) {

    new CronJob('*/30 * * * * *', function () {

        Profile.refreshTokenAndUpdateSongs(refresh_token, callback);

    }).start();
}

router.use('/me', function (req, res) {

    Profile.getProfile(req.auth).then((profileResult) => {

        var callback = function (new_access_token) {

            req.session.spotifyID = req.session.spotifyID;
            req.session.loggedin = true;
            req.session.auth_token = new_access_token;

            req.session.save(function (err) {
                if (err) {
                    console.log(err);
                }
            });

            Profile.updateRecentlyPlayedSongs(req.session.spotifyID, req.session.auth_token);
        };

        ProfileSchema = profileResult;
        if (ProfileSchema.result && req.session.loggedin) {
            req.session.spotifyID = ProfileSchema.spotifyID;

            res.send('Welcome back! ' + ProfileSchema.name);
        } else if (req.session.loggedin) {
            req.session.spotifyID = ProfileSchema.spotifyID;
            startCronJob(req.session.refresh_token, callback);

            res.send('Welcome ' + ProfileSchema.name + ', You were registered as a new user');
        } else {

            res.send('Please login first');
        }
    });
});

router.use('/top/:type', function (req, res) {
    // type can be artists or tracks
    // depending on type you get a different obj with different fields
    Profile.getTop(req.auth, req.params.type).then((something) => {
        res.send(something);
    });
});

router.use('/spotify', function (req, res) {

    if (req.session.spotifyID === undefined) {
        res.send('Spotify Id missing. Call /me');
    } else if (req.session.loggedin) {

        var spotifyId = req.session.spotifyID;
        var auth_token = req.session.auth_token;

        Profile.updateRecentlyPlayedSongs(spotifyId, auth_token);
        res.send('Updated profile.');

    } else {

        res.send('Please login first');
    }
});

router.use('/assets',express.static('assets'));
router.use('/images',express.static('images'));

router.get("*", function (req, res) {
    res.send("Page not found");
    res.end();
});

module.exports = router;