var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IngSchema = new Schema({
    amount: { type: Number, required: true },
    timestamp: { type: Date, required: true }
});

module.exports = IngSchema;