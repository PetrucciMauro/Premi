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

							  var to_set = {};
							  to_set["paths"] = new_element;
							  
							  var query = {"meta.titolo": name_pres};
							  
							  db.collection('presentations'+req.user).update({ query, {"$set" : to_set }} , function(err, doc){
																							  if(err) throw err;
																							  
																							  res.json({
																										  success: true,
																										  });
																							  db.close();
																							 });
							  });
};

exports.put = put;