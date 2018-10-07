var Profile = require('../models/Profile');
var request = require("request");
var mongoose = require('mongoose');
var dateUtil = require('../helpers/dateUtil');
var baseUrl = "https://api.spotify.com/v1/me";

function getProfile(auth_token) {

    return main(baseUrl, auth_token);
}

function updateRecentlyPlayedSongs(userId, auth_token) {
    var url = `${baseUrl}/player/recently-played?limit=50`;

    updateSongs(url, userId, auth_token, initializePromiseRecentlyPlayedSongs);
}

function initializePromiseRecentlyPlayedSongs(url, auth_token, userId) {
    var options = {
        url: url,
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        json: true
    };

    var promise = new Promise(function (resolve, reject) {
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(updateProfile(userId, body["items"]));
            }
        })
    });

    promise.then(function (err) {
        console.log(err);
    })
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
                        resolve({ 'result': check, 'name': result.name, 'spotifyID': result.spotifyID });
                    }
                    if (!result) {
                        resolve(createProfile(body));
                    }
                });
            }
        })
    })
}

//repo
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

//repo
var updateProfile = function (userId, items) {
    
    if (items === undefined) {
        console.log("items not found.");
        return;
    }

    items.forEach(item => {
        var spotifyId = item["track"]["id"];
        var played_at = item["played_at"];

        Profile.findOne({
            spotifyID: userId
        }, function (err, profile) {
            if (err) {
                console.log(err);
                return;
            }

            if(profile === null)
            {
                console.log("profile is null. (updateProfile)");
                return;
            }

            profile.songs.push({
                id: spotifyId,
                played_at: played_at
            })

            profile.save(function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        });
    });
}

//repo
var updateSongs = function (url, userId, auth_token, callback) {

    Profile.aggregate([{
            $project: {
                '__v': 0,
                '_id': 0,
                'songs._id': 0
            }
        },
        {
            $match: {
                spotifyID: userId
            }
        }, {
            $unwind: "$songs"
        },
        {
            $sort: {
                "songs.played_at": -1
            }
        },
        {
            $limit: 1
        }
    ], function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        var item = data[0];

        if (item !== undefined) {
            var timestamp = item["songs"]["played_at"];
            timestamp = new Date(timestamp);
            timestamp = dateUtil.getUnixTimeStampClean(timestamp);
    
            if (timestamp !== undefined) {
                url = url + `&after=${timestamp}`;
            }
        }
            
        callback(url, auth_token, userId);
    });
}

module.exports = {
    updateRecentlyPlayedSongs,
    getProfile
}