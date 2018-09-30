var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SongSchema = require('./Song');


var ProfileSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    country: String,
    spotifyID: String,
    createdOn: { type: Date, default: Date.now },
    songs: [SongSchema],
    //balance
});


var Profile = mongoose.model('Profile', ProfileSchema);
module.exports = Profile;