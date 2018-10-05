var Profile = require('../models/Profile');
var Song = require('../models/Song');
var request = require("request");
var mongoose = require('mongoose');


function getProfile(auth_token) {

    return main("https://api.spotify.com/v1/me/", auth_token);
}

function main(urls, auth_token) {
    return initialize(urls, auth_token)
        .then((result) => {
            return result;
        }, function (err) {
            console.log(err);
        })
}

function initialize(urls, auth_token) {
    // Setting URL and headers for request
    var options = {
        url: urls,
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        json: true
    };
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            if (err) {                
                reject(err);
            } else {
                let check = false;
                var query = Profile.findOne({ 'spotifyID': body.id });
                if (query) {
                    check = true;
                }
                // resp.send('something');
                query.exec(function (err, result) {
                    if (err) return handleError(err);
                    if (result) {
                        resolve({ 'result': check, 'name': result.name });
                    }
                    if (!result) {
                        resolve(createProfile(body));
                    }
                });
            }
        })
    })
}

var createProfile = function (body) {

    var name = body["display_name"];
    var country = body["country"];
    var spotifyId = body["id"];
    var email = body["email"];

    var profile = new Profile(
        {
            _id: new mongoose.Types.ObjectId(),
            name: name,
            country: country,
            spotifyID: spotifyId,
            email: email
        }
    );
    profile.save(function (err) {
        if (err) console.log(err);
    });

    return profile;
};

var updateProfile = function (userId, items) {

    //check if undefined (items)
    items.forEach(item => {
        var spotifyId = item["track"]["id"];
        var played_at = item["played_at"];

        Profile.findOne({ spotifyID: userId }, function (err, profile) {
            if (err) { console.log(err); }

            profile.songs.push({
                id: spotifyId,
                played_at: played_at
            })

            profile.save(function (err) {
                if (err) { console.log(err); }
            });
        });
    });
}

var getMostRecentSongUnixTimestamp = function (userId) {
    // Profile.find({spotifyID: userId}).sort([['songs.played_at', 'desc']]).limit(1).exec(function(err, docs) {
    //    // console.log(docs.songs[0].played_at);
    //     console.log(docs[0].songs[0]);

    // });

    Profile.aggregate([
        { $match: { spotifyID: userId } },
        { $unwind: "$songs" },
        { $group: { _id: "$_id" } }
    ])

    // Profile.findOne({ spotifyID: userId }, function(err, doc) {
    //     doc.songs.sort(function)
    // })
}

module.exports = {
    updateProfile,
    getMostRecentSongUnixTimestamp,
    getProfile
}