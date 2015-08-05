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
							  var name_pres = req.originalUrl.split("/")[5];
							  var name_tocopy = req.originalUrl.split("/")[6];
							  db.collection('presentations'+req.user).findOne({'meta.titolo' : name_pres},function(err, doc){
																							  if(doc != null){
																							  res.json({success : false});
																							  db.close();
																							  }
																							  else{
																							  db.collection('presentations'+req.user).findOne({ 'meta.titolo': name_tocopy }, function(err, doc){
																																							  if(err) throw err;
																																							  var new_presentation = doc;
																																							  new_presentation.meta.titolo = name_pres;
																																							  delete new_presentation._id;
																																							  db.collection('presentations'+req.user).insert(new_presentation, function(err, result){
																																																							 if(err) throw err;
																																																							 res.json({
																																																										 success: true,
																																																										 message: 'inserted presentation',
																																																										 //id_pres: result.ops[0]._id.toString()
																																																										 });
																																																							 db.close();
																																																							 });
																																							  });
																							  }
																							  });
							  });
};

exports.post = post;