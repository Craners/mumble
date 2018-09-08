var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HistorySchema = require('./History');


var ProfileSchema = new Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    country:String,
    id:String,
    createdOn: { type: Date, default: Date.now },
    history: [HistorySchema]
});


var Profile = mongoose.model('Profile', ProfileSchema );
module.exports = Profile;