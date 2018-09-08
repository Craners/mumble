var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var HistorySchema = new Schema({
    year: {
        date: {
            songs: [
                {
                    id: { type: Number, required: true },
                    played_at: { type: Date, required: true }
                }
            ],
            balances: [
                {
                    amount: { type: Number, required: true },
                    timestamp: { type: Date, required: true }
                }
            ]
        }
    }
});

module.exports = HistorySchema;