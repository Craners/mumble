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

    new Promise(function (resolve, reject) {
        request.post(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(console.log(`${resp.statusCode}-${resp.statusMessage}-createPlaylist`));
            }
        })
    });
}

module.exports = {
    createPlaylist
}