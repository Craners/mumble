var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SongSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    played_at: {
        type: Date,
        required: true
    },
    name: {
        type: String
    },
    artist_id: {
        type: String
    },
    artist_name: {
        type: String
    },
    genres: {
        type: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = SongSchema;