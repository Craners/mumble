var Profile = require('../models/Profile');
//var History = require('../models/History');
var Song = require('../models/Song');

var createProfile = function (name, country, id, email) {
    var profile = new Profile(
        {
            _id: new mongoose.Types.ObjectId(),
            name: name,
            country: country,
            id: id,
            email: email
        }
    );
    profile.save(function (err) {
        if (err) console.log(err);
    });
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
        {$match: {spotifyID: userId}},
        {$unwind: "$songs"},
        {$group: {_id: "$_id"}}
    ])

    // Profile.findOne({ spotifyID: userId }, function(err, doc) {
    //     doc.songs.sort(function)
    // })
}

module.exports = {
    createProfile,
    updateProfile,
    getMostRecentSongUnixTimestamp
}