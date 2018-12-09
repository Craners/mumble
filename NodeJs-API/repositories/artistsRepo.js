var request = require("request");
var baseUrl = "https://api.spotify.com/v1";

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

async function topTracksUris(artistId, country, auth_token)
{
    var options = {
        url: `${baseUrl}/artists/${artistId}/top-tracks?country=${country}`,
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        json: true
    };

    var computeTracksUris = function(tracks)
    {
        var songsString = '';

        // tracks.forEach(track => {
        //     songsString.concat(`${track.uri},`);
        // });

        for(var i = 0; i < tracks.length; i++)
        {
            var track = tracks[i];
            songsString += `${track.uri},`;
        }
                
        songsString = songsString.slice(0, -1);
        return songsString;
    }

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

module.exports = {
    getGenres,
    topTracksUris
}