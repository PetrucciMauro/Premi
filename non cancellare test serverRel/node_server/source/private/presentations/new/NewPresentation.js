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
							  
							  db.collection('presentations'+req.user).findOne({'meta.titolo' : name_pres},function(err, doc){
																						  if(err) throw err;
																							  if(doc != null){ res.json({success : false}); db.close();
																						  }
																						  else{
																						  console.log(doc);
																							  var proper = { 'paths': {'main': [], 'choices': []}, 'texts': [], 'frames': [], 'images': [], 'SVGs': [], 'audios': [], 'videos': [], 'background' : {'id' : 0} };
																						  var new_presentation = {'meta': {'titolo': name_pres}, 'proper': proper };
																						  db.collection('presentations'+req.user).insert(new_presentation, function(err, result){
																																						 if(err) throw err;
																																						 res.json({
																																									 success: true,
																																									 message: 'inserted presentation',
																																									 //id_pres: result.ops[0]._id.toString()
																																									 });
																																						 db.close();
																																						 });
																						  }
																						  });
							  });
};

exports.post = post;