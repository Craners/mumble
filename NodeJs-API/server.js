let express = require('express');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session')
require('dotenv').config();

// var mongoDB = 'mongodb://root:root@localhost:27017/mumble';
var mongoDB = 'mongodb://amir:amir12@ds249992.mlab.com:49992/mumble';
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let app = express()
app.use(cookieParser());
var auth_token = false;
app.use(session({ secret: 'secret' }));


// app.get("/spotify", function (req, res) {
//     //I have to get the most recent song//
//     let settings = {
//         url: 'https://api.spotify.com/v1/me/player/recently-played',
//         headers: {
//             'Authorization': `Bearer ${auth_token}`
//         },
//         json: true
//     }
//     request.get(settings, function (error, response, body) {
//         //  ProfileRepo.getMostRecentSongUnixTimestamp('radu.stoica94');
//         //get this ID dynamically
//         console.log(body);

//         ProfileRepo.updateProfile('radu.stoica94', body["items"]);

//         res.redirect('/');
//     })
// });


app.use((req, res, next) => {

    if (req.session.auth_token !== null) {

        req.auth = req.session.auth_token;
        // console.log('it had a token');
        // console.log('Token:' + req.session.auth_token);
    }
    next()
}, require('./routes/router'));

let port = process.env.PORT || 8888
console.log(`Listening on port http://localhost:${port}. Go /login to initiate authentication flow.`);
app.listen(port);