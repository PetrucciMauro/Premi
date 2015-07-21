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
var get = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
							  if(err) throw err;
							  var id_pres = req.originalUrl.split("/")[4];
							  var objectId = new ObjectID(id_pres);
							  db.collection('presentations'+req.user).findOne({ '_id': objectId }, function(err, doc){
																							  if(err) throw err;
																							  
																							  res.json({
																										  success: true,
																										  message: doc
																										  });
																							  db.close();
																							  
																							  });
							  });
};

var del = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
							  if(err) throw err;
							  var id_pres = req.originalUrl.split("/")[4];
							  var objectId = new ObjectID(id_pres);
							  db.collection('presentations'+req.user).remove({ '_id': objectId }, function(err, removed){
																							 if(err) throw err;
																																																																				
																							 res.json({
																										 success: true,
																										 message: 'removed presentation _id: '+id_pres
																										 });
																							 db.close();
																							 
																							 });
							  });
};

exports.get = get;
exports.delete = del;