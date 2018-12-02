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
        type: String,
        required: true
    },
    artist_name: {
        type: String,
        required: true
    },
    genres: {
        type: [String],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = SongSchema;