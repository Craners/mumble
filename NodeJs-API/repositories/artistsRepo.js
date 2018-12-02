var Profile = require('../models/Profile');
var request = require("request");
var mongoose = require('mongoose');
var dateUtil = require('../helpers/dateUtil');
var baseUrl = "https://api.spotify.com/v1";

async function getGenre(id, auth_token) {

    console.log(baseUrl + '/artists?=ids=' + id);

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
                // console.log(body.artists[0].genres);
                resolve((body.artists[0].genres));
            }
        })
    });

}

module.exports = {
    getGenre
}