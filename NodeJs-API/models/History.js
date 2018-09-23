var mongoose = require('mongoose');
var SongSchema = require('./Song');
var IngSchema = require('./ING');
var Schema = mongoose.Schema;


var HistorySchema = new Schema({

    years: [{
        year: { type: String, required: true },
        days: [{
            day: { type: String, required: true },
            songs: { type: [SongSchema], required: true },
            balances: { type: [IngSchema] }
        }]
    }]

});

module.exports = HistorySchema;