var request = require("request");
var baseUrl = "https://api.spotify.com/v1";
var Profile = require('../models/Profile');

async function getGenres(id, auth_token) {

    var options = {
        url: baseUrl + '/artists?=ids=' + id,
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        json: true
    };

    return new Promise(function (resolve, reject) {
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve((body.artists[0].genres));
            }
        })
    });
}

var computeTracksUris = function(tracks)
{
    var songsString = '';

    for(var i = 0; i < tracks.length; i++)
    {
        var track = tracks[i];
        songsString += `${track.uri},`;
    }
            
    songsString = songsString.slice(0, -1);
    return songsString;
}

async function topTracksUris(artistId, country, auth_token)
{
    var options = {
        url: `${baseUrl}/artists/${artistId}/top-tracks?country=${country}`,
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        json: true
    };

    return new Promise(function (resolve, reject) {
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(computeTracksUris(body.tracks));
            }
        })
    });
}

async function historyTimeRetrieval(id, time) {

    Profile.aggregate([{
        $project: {
            '__v': 0,
            '_id': 0,
            'songs._id': 0
        }
    },
    {
        $match: {
            spotifyID: id,
            //check this date later. im not 100% sure if it's working correctly
            'songs.played_at': {
                $gte: new Date("2018-12-08T00:00:00.0Z"),
                $lt: new Date("2018-12-20T00:00:00.0Z")
            }
        }
    }, {
        $unwind: '$songs'
    },
    {
        $sort: {
            'songs.played_at': -1
        }

    },
    {
        $limit: 50
    }
    ], function (err, data) {
        // console.log(data);
        data.forEach(el => {
            console.log(el.songs.played_at);
            console.log(el.songs.artist_name);

        });
    });

}

module.exports = {
    getGenres,
    topTracksUris,
    historyTimeRetrieval
}