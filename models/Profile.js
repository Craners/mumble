var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ProfileSchema = new Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    country:String,
    id:Number,
    createdOn: { type: Date, default: Date.now }
});


var Profile = mongoose.model('Profile', ProfileSchema );
module.exports = Profile;