var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HistorySchema = require('./History');
var request = require("request");


var ProfileSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    country: String,
    spotifyID: String,
    createdOn: { type: Date, default: Date.now },
    history: [HistorySchema]
});


var Profile = mongoose.model('Profile', ProfileSchema);
module.exports = Profile;


module.exports.getProfile = function (auth_token) {
    // var query = { id: id };
    // SongSchema.findOne(query, callback);
    main("https://api.spotify.com/v1/me/", auth_token);
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
                var query = Profile.findOne({ 'spotifyID': body.id });
                query.exec(function (err, result) {
                    if (err) return handleError(err);
                    if (result) {
                        //to:do
                        resolve(console.log('found it'));
                        // result.rate += newBeer.rate;
                        // result.save(callback);
                    }
                    if (!result) {
                        resolve(createProfile(body));
                    }
                });
                // resolve(body.id);
            }
        })
    })

}

function main(urls, auth_token) {
    var initializePromise = initialize(urls, auth_token);
    initializePromise.then(function (result) {
        userDetails = result;
        console.log("Initialized user details");
        // Use user details from here
        // console.log(userDetails)
    }, function (err) {
        console.log(err);
    })
}

function createProfile(body) {

    var awesome_instance = new Profile(
        {
            name: body["display_name"],
            country: body["country"],
            spotifyID: body["id"],
            email: body["email"],
            history: [{
                years: [{
                    year: '2018',
                    days: [{
                        day: '01/01',
                        songs: [{
                            id: 1203,
                            played_at: Date.now()
                        }]
                    },
                    {
                        day: '02/01',
                        songs: [{
                            id: 2134,
                            played_at: Date.now()
                        }]
                    }]
                }]
            }]
        }
    );
    awesome_instance.save(function (err) {
        if (err) console.log(err);
        // saved!
    });
    console.log(awesome_instance);
}