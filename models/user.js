// get an instance of mongoose and mongoose schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//define a model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
    name: String,
    password: String,
    admin: Boolean
}));
