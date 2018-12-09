var request = require("request");
var baseUrl = "https://api.spotify.com/v1";

var createPlaylist = function(userId, auth_token, name, desc)
{
    var url = `${baseUrl}/users/${userId}/playlists`;

    var body = {
        "name": name,
        "description": desc,
        "public": true
    };

    var options = {
        url: url,
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        body: body,
        json: true
    };

    return new Promise(function (resolve, reject) {
        request.post(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body["id"]);
            }
        })
    });
}

var addTrackToPlaylist = function(playlistId, songsString)
{
    if(songsString === undefined || songsString === null || songsString == '') {
        console.error("songsArray is empty or something! addTrackToPlaylist not called.");
        return;
    }

    var url = `${baseUrl}/playlists/${playlistId}/tracks?uris=${songsString}`;

    var options = {
        url: url,
        headers: {
            'Authorization': `Bearer ${auth_token}`
        },
        json: true
    };

    new Promise(function (resolve, reject) {
        request.post(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(console.log(`${resp.statusCode}-${resp.statusMessage}-addTrackToPlaylist`));
            }
        })
    });
}

module.exports = {
    createPlaylist,
    addTrackToPlaylist
}