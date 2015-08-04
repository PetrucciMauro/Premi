//==============
// configuration
//==============

var config = require('../../../config');
var database = config.database;
var MongoClient = require('mongodb').MongoClient;

//=========
// resource
//=========
var get = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
							  if(err) throw err;
							  
							  db.collection('presentations'+req.user).find().toArray(function(err, doc){
																										if(err) throw err;
																										message = [];
																										doc.forEach(function(pres){
																														message.push(pres.meta);
																														});
																										
																										res.json({
																													success: true,
																													message: message
																													});
																										db.close();
																										
																										});
							  });
};

exports.get = get;