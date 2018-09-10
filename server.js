let express = require('express');
let request = require('request');
var path = require('path');
let querystring = require('querystring');
var mongoose = require('mongoose');
var Profile = require('./models/Profile');
var routes = require('./routes/spotify');
require('dotenv').config();

var mongoDB = 'mongodb://amir:amir12@ds249992.mlab.com:49992/mumble';
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

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
        // historyElement.save();

        // console.log(historyElement.years[0].days[0].songs);

        console.log(response.body["items"][0]["track"]["name"])
        console.log(response.body["items"][0]["track"]["id"]);
        console.log(response.body["items"][0]["played_at"]);
        res.redirect('/');
    })
});

app.use('/spotify2', routes);

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

            var awesome_instance = new Profile(
                {
                    name: response.body["display_name"],
                    country: response.body["country"],
                    id: response.body["id"],
                    email: response.body["email"],
                    history: [{
                        years: [{
                            year: '2018',
                            days: [{
                                day: '01/01',
                                songs: [{
                                    id: 1203,
                                    played_at: Date.now()
                                }]
                            },
                            {
                                day: '02/01',
                                songs: [{
                                    id: 2134,
                                    played_at: Date.now()
                                }]
                            }]
                        }]
                    }]
                }
            );
            awesome_instance.save(function (err) {
                if (err) console.log(err);
                // saved!
            });
        }
        res.redirect('/');
    });
});

let port = process.env.PORT || 8888
console.log(`Listening on port https://localhost:${port}. Go /login to initiate authentication flow.`)
app.listen(port)