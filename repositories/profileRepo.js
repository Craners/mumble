var Profile = require('../models/Profile');
var request = require("request");
var mongoose = require('mongoose');
var dateUtil = require('../helpers/dateUtil');
var baseUrl = "https://api.spotify.com/v1/me";
var ArtistRepo = require('../repositories/artistsRepo');


function getProfile(auth_token) {

    return main(baseUrl, auth_token);
}

async function updateRecentlyPlayedSongs(userId, auth_token) {
    var url = `${baseUrl}/player/recently-played?limit=50`;

    await updateSongs(url, userId, auth_token, initializePromiseRecentlyPlayedSongs);
}

async function initializePromiseRecentlyPlayedSongs(url, auth_token, userId) {
    console.log(`${new Date().toLocaleString()}-${url} \n`);

    var options = {
        url: url,
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        json: true
    };

    return await new Promise(async function (resolve, reject) {
        await request.get(options, function (err, resp, body) {
            if (err) {
                console.error(`${err}-Error update songs.`);
                reject(err);
            } else {
                resolve(updateProfile(userId, body["items"], auth_token));
            }
        })
    });
}

function getTop(auth_token, type, time) {

    return topPromise("https://api.spotify.com/v1/me/top/", auth_token, type, time);
}

function topPromise(url, auth_token, type, time) {
    return initializeTop(url, auth_token, type, time)
        .then((result) => {
            return result;
        }, function (err) {
            console.error(err);
        })
}

function initializeTop(url, auth_token, type, time) {

    let settings = {
        url: `${url}${type}`,
        qs: {
            time_range: time,
            limit: '10'
        },
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        json: true
    };
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(settings, (err, resp, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(expload(body["items"], type));
            }
        })
    });
}

//{ 'name': body["items"][0].name, 'genre': body["items"][0].genres }
function expload(body, type) {

    let result = [];
    body.forEach((index) => {

        let obj = {};
        obj.name = index.name;
        if (type == 'artists') {
            obj.genre = index.genres;
            obj.image = index.images[0].url;
            obj.id = index.id;
        } else {
            obj.image = index.album.images[0].url;
            obj.artistsName = [];
            let tempArrayArtists = index.artists;
            tempArrayArtists.forEach((artist) => {
                obj.artistsName.push(artist.name);
            });
        }
        obj.type = index.type;
        result.push(obj);
    });
    return result;
}

function main(urls, auth_token) {
    return initialize(urls, auth_token)
        .then((result) => {
            return result;
        }, function (err) {
            console.error(err);
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
                var query = Profile.findOne({
                    'spotifyID': body.id
                });
                if (query) {
                    check = true;
                }
                // resp.send('something');
                query.exec(function (err, result) {
                    if (err) return handleError(err);
                    if (result) {
                        resolve({
                            'result': check,
                            'name': result.name,
                            'spotifyID': result.spotifyID
                        });
                    }
                    if (!result) {
                        resolve(createProfile(body));
                    }
                });
            }
        })
    })
}

var refreshTokenAndUpdateSongs = function (refresh_token, callback) {
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            refresh_token: refresh_token,
            grant_type: 'refresh_token'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'))
        },
        json: true
    }
    request.post(authOptions, function (error, response, body) {
        callback(body.access_token);
    })
};

//repo
var createProfile = function (body) {

    var name = body["display_name"];
    var country = body["country"];
    var spotifyId = body["id"];
    var email = body["email"];

    var profile = new Profile({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        country: country,
        spotifyID: spotifyId,
        email: email
    });
    profile.save(function (err) {
        if (err) console.error(err);
    });

    return profile;
};

//repo
var updateProfile = async function (userId, items, auth_token) {

    if (items === undefined) {
        console.error("items not found.");
        return;
    }

    await items.forEach(item => {
        var spotifyId = item["track"]["id"];
        var name = item["track"]["name"];
        var artist_id = item["track"]["artists"][0]["id"];
        var artist_name = item["track"]["artists"][0]["name"];
        var played_at = item["played_at"];

        Profile.findOne({
            spotifyID: userId
        }, async function (err, profile) {
            if (err) {
                console.error(err);
                return;
            }

            if (profile === null) {
                console.error("profile is null. (updateProfile)");
                return;
            }

            profile.songs.push({
                id: spotifyId,
                played_at: played_at,
                name: name,
                artist_id: artist_id,
                artist_name: artist_name,
                genres: await ArtistRepo.getGenres(artist_id, auth_token).then((result) => {
                    return result;
                })
            })

            profile.save(function (err) {
                if (err) {
                    console.error(err);
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
        try {
            if (err) {
                throw new Error(err);
            }
            var item = data[0];

            if (item === undefined) {
                console.error("item is not defined. (from DB)")
            } else {
                var timestamp = item["songs"]["played_at"];
                timestamp = new Date(timestamp);
                timestamp = dateUtil.getUnixTimeStampClean(timestamp);

                if (timestamp !== undefined) {
                    url = url + `&after=${timestamp}`;
                }

                console.log(`${userId}:${item["songs"]["name"]}-${item["songs"]["played_at"]}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            callback(url, auth_token, userId);
        }
    });
}

module.exports = {
    updateRecentlyPlayedSongs,
    getProfile,
    getTop,
    refreshTokenAndUpdateSongs
}