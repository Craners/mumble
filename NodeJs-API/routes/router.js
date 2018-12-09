var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
let querystring = require('querystring');
let request = require('request');
var Profile = require('../repositories/profileRepo');
var Playlist = require('../repositories/playlist');
var ArtistRepo = require('../repositories/artistsRepo');
var ProfileSchema = require('../models/Profile');
var CronJob = require('cron').CronJob;

let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8888/callback';

//Middleware that is specific to this router
router.use(function timeLog(req, res, next) {

    console.log('request code: ' + res.statusCode);
    console.log('request url: ' + req.url);
    console.log('request date: ' + new Date().toUTCString());
    next();
});

router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '../../index.html'));
});

router.get('/login', function (req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: 'user-read-private user-read-email user-read-recently-played user-top-read playlist-modify-public',
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

    var cronTime = /*"5 * * * * *"*/ "0 */55 * * * *"; //starting from 55th minute, every 55 minutes.

    new CronJob({
        cronTime: cronTime,
        onTick: function () {

            Profile.refreshTokenAndUpdateSongs(refresh_token, callback);

        },
        runOnInit: true
    }).start();
}

router.use('/me', function (req, res) {
    Profile.getProfile(req.auth).then((profileResult) => {

        var callback = async function (new_access_token) {

            req.session.spotifyID = req.session.spotifyID;
            req.session.loggedin = true;
            req.session.auth_token = new_access_token;

            req.session.save(function (err) {
                if (err) {
                    console.log(err);
                }
            });

            await Profile.updateRecentlyPlayedSongs(req.session.spotifyID, req.session.auth_token);
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

router.use('/top/:type/:time', function (req, res) {
    // type can be artists or tracks
    // depending on type you get a different obj with different fields
    if (typeof req.params.type !== 'undefined' && typeof req.params.time !== 'undefined') {
        Profile.getTop(req.auth, req.params.type, req.params.time).then((something) => {
            res.send(something);
        });
    } else {
        res.send('Please declare type and term');
    }
});

router.use('/spotify', async function (req, res) {
    if (req.session.spotifyID === undefined) {
        res.send('Spotify Id missing. Call /me');
    } else if (req.session.loggedin) {

        var spotifyId = req.session.spotifyID;
        var auth_token = req.session.auth_token;

        await Profile.updateRecentlyPlayedSongs(spotifyId, auth_token);
        res.send('Updated profile.');

    } else {

        res.send('Please login first');
    }
});

// router.get('/playlist/:name/:desc', function (req, res) {
//     if (typeof req.params.name !== 'undefined' && typeof req.params.desc !== 'undefined') {
//         var nameOfPlaylist = req.params.name;
//         var descOfPlaylist = req.params.desc;
//         if (req.session.spotifyID === undefined) {
//             res.send('Spotify Id missing. Call /me');
//         } else if (req.session.loggedin) {
//             Playlist.createPlaylist(req.session.spotifyID, req.session.auth_token, nameOfPlaylist, descOfPlaylist);
//             res.end();
//         } else {

//             res.send('Please login first');
//         }
//     }
// });

//artistId:44TGR1CzjKBxSHsSEy7bi9 //for testing
//country:NL
router.get('/playlist/:name/:description/:artistId/:country', async function (req, res) {
    if (typeof req.params.name !== 'undefined' && typeof req.params.description !== 'undefined' && typeof req.params.artistId !== 'undefined' && typeof req.params.country !== 'undefined') {
        var nameOfPlaylist = `${req.params.name} By Mumble`;
        var descOfPlaylist = req.params.description;
        var artistId = req.params.artistId;
        var country = req.params.country;
        var userId = req.session.spotifyID;

        if (userId === undefined) {
            res.send('Spotify Id missing. Call /me');
        } else if (req.session.loggedin) {
            var auth_token = req.session.auth_token;

            //Create an empty playlist  
            var playlistId = await Playlist.createPlaylist(userId, auth_token, nameOfPlaylist, descOfPlaylist);
            //Get top 10 tracks of the artist
            var tracks = await ArtistRepo.topTracksUris(artistId, country, auth_token);
            //Add the tracks to the created playlist.
            Playlist.addTrackToPlaylist(playlistId, tracks);
                
            res.end();
        } else {

            res.send('Please login first');
        }
    }
    else
    {
        res.send("params not good.");
    }
});

router.use('/getgenre/:id', function (req, res) {

    if (req.session.spotifyID === undefined) {
        res.send('Spotify Id missing. Call /me');
    } else if (req.session.loggedin) {

        var auth_token = req.session.auth_token;
        ArtistRepo.getGenres(req.params.id, auth_token).then((result) => {

            res.send(result);
        });
    } else {

        res.send('Please login first');
    }
});

router.use('/assets', express.static('assets'));
router.use('/images', express.static('images'));

router.get("*", function (req, res) {
    res.send("Page not found");
    res.end();
});

module.exports = router;