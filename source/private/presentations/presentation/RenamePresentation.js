//==============
// configuration
//==============

var config = require('../../../../config');
var database = config.database;
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID

//=========
// resource
//=========
var post = function(req, res){
																								
	MongoClient.connect(database, function(err, db) {
							  if(err) throw err;
							  var id_pres = req.originalUrl.split("/")[4];
							  var name_pres = req.originalUrl.split("/")[5];
							  
							  var objectId = new ObjectID(id_pres);
							  db.collection('presentations'+req.user).update({ '_id': objectId }, {$set: { 'meta.name' : name_pres }}, function(err, doc){
																							 if(err) throw err;
																							 
																							 res.json({
																										 success: true,
																										 message: 'renamed presentation: '+name_pres
																										 });
																							 db.close();
																							 
																							 });
							  });
};


exports.post = post;