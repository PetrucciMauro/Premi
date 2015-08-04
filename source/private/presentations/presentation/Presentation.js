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
							  var name_pres = req.originalUrl.split("/")[4];
							  db.collection('presentations'+req.user).findOne({ 'meta.titolo': name_pres }, function(err, doc){
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
							  var name_pres = req.originalUrl.split("/")[4];
							  db.collection('presentations'+req.user).remove({ 'meta.titolo': name_pres }, function(err, removed){
																							 if(err) throw err;
																																																																				
																							 res.json({
																										 success: true,
																										 message: 'removed presentation: '+name_pres
																										 });
																							 db.close();
																							 
																							 });
							  });
};

exports.get = get;
exports.delete = del;