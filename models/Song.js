var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SongSchema = new Schema({
    id: { type: Number, required: true },
    played_at: { type: Date, required: true }
});

module.exports = SongSchema;

module.exports.getSongs = function (id, callback) {
    var query = { id: id };
    // SongSchema.findOne(query, callback);
}