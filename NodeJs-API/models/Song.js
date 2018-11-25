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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = SongSchema;