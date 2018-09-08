var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SongSchema = new Schema({
    id: { type: Number, required: true },
    played_at: { type: Date, required: true }
});

module.exports = SongSchema;