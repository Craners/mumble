var express = require('express');
var router = express.Router();
var path = require('path');
let querystring = require('querystring');
let request = require('request');
var Profile = require('../repositories/profileRepo');
var ProfileSchema = require('../models/Profile');
var session = require('express-session')

let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8888/callback';

//Middle ware that is specific to this router
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

router.get('/login', function (req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: 'user-read-private user-read-email user-read-recently-played',
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
        req.session.auth_token = auth_token;
        req.session.loggedin = true;
        res.redirect('/');
    })
});

router.use('/me', function (req, res) {

    Profile.getProfile(req.auth).then((profileResult) => {

        ProfileSchema = profileResult;
        if (ProfileSchema.result && req.session.loggedin) {

            req.session.spotifyID = ProfileSchema.spotifyID;
            res.send('Welcome back! ' + ProfileSchema.name);
        }
        else if (req.session.loggedin) {

            req.session.spotifyID = ProfileSchema.spotifyID;
            res.send('Welcome ' + ProfileSchema.name + ', You were registered as a new user');
        }
        else {

            res.send('Please login first');
        }
    });
});

router.use('/spotify', function (req, res) {

    //I have to get the most recent song//
    let settings = {
        url: 'https://api.spotify.com/v1/me/player/recently-played',
        headers: {
            'Authorization': `Bearer ${req.session.auth_token}`
        },
        json: true
    }
    request.get(settings, function (error, response, body) {
        
        if (req.session.loggedin) {

            Profile.updateProfile(req.session.spotifyID, body["items"]);
            res.send(body);
        } else {

            res.send('Please login first');
        }

        // res.redirect('/');
    })
});

router.get("*", function (req, res) {
    res.send("Page not found");
    res.end();
});

module.exports = router;