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

module.exports = {
    getGenres
}