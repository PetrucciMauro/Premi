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
var put = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
							  if(err) throw err;
							  
							  var name_pres = req.originalUrl.split("/")[4];
							  var new_element = req.body.element;
							  var to_set = {};
							  to_set["proper.paths"] = new_element;
							  
							  var query = {"meta.titolo": name_pres};
							  console.log(to_set);
							  console.log(name_pres);
							  
							  db.collection('presentations'+req.user).update( {"meta.titolo" : name_pres}, {"$set" : {"proper.paths" : new_element} }, function(err, doc){
																							  if(err) throw err;
																							  
																							  res.json({
																										  success: true,
																										  });
																							  db.close();
																							 });
							  });
};

exports.put = put;