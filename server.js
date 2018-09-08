let express = require('express');
let request = require('request');
var path = require('path');
let querystring = require('querystring');
var mongoose = require('mongoose');
var Profile = require('./models/Profile');
var mongoDB = 'mongodb://localhost:27018/mumbleDev';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

require('dotenv').config();

let app = express()

var auth_token;

let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8888/callback';

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/login', function (req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: 'user-read-private user-read-email user-read-recently-played',
            redirect_uri
        }))
})

app.get('/callback', function (req, res) {
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
        //let uri = process.env.FRONTEND_URI || 'http://localhost:8888'
        res.redirect('/');
    })
})

app.get("/spotify", function (req, res) {
    let settings = {
        url: 'https://api.spotify.com/v1/me/player/recently-played',
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        json: true
    }
    request.get(settings, function (error, response, body) {
        if (response.body["error"]) {
            console.log(response.body);
        }
        else {
            console.log(response.body["items"][0]["track"]["name"])
            console.log(response.body["items"][0]["track"]["id"]);
            console.log(response.body["items"][0]["played_at"]);
        }
        res.redirect('/');
    })
});

app.get("/profile", function (req, res) {
    let settings = {
        url: 'https://api.spotify.com/v1/me/',
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        json: true
    }
    request.get(settings, function (error, response, body) {
        if (response.body["error"]) {
            console.log(response.body);
        }
        else {
            console.log(response.body["display_name"])
            console.log(response.body["email"]);
            console.log(response.body["id"]);
            console.log(response.body["country"]);
            var awesome_instance = new Profile({ name: 'awesome' });
            awesome_instance.save(function (err) {
                if (err) return handleError(err);
                // saved!
            });
        }
        res.redirect('/');
    });
});

let port = process.env.PORT || 8888
console.log(`Listening on port https://localhost:${port}. Go /login to initiate authentication flow.`)
app.listen(port)