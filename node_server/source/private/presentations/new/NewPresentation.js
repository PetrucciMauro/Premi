//==============
// configuration
//==============

var config = require('../../../../config');
var database = config.database;
var MongoClient = require('mongodb').MongoClient;

//=========
// resource
//=========
var post = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
							  if(err) throw err;
							  var name_pres = req.originalUrl.split("/")[5];
							  var proper = { 'paths': {'main': [], 'choices': []}, 'texts': [], 'frames': [], 'images': [], 'SVGs': [], 'audios': [], 'videos': [], 'background' : [] };
							  var new_presentation = {'meta': {'titolo': name_pres}, 'proper': proper };
							  db.collection('presentations'+req.user).insert(new_presentation, function(err, result){
																							 if(err) throw err;
																							 res.json({
																										 success: true,
																										 message: 'inserted presentation',
																										 id_pres: result.ops[0]._id.toString()
																										 });
																							 db.close();
																							 });
							  });
};

exports.post = post;