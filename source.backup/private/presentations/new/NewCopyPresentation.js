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
																					var id_tocopy = req.originalUrl.split("/")[6];
																					var objectId = new ObjectID(id_tocopy);
																					db.collection('presentations'+req.user).findOne({ '_id': objectId }, function(err, doc){
																																																																					if(err) throw err;
																																																																					var new_presentation = doc;
																																																																					new_presentation.meta.name = name_pres;
																																																																					delete new_presentation._id;
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
																					
																					
																					
																					
																					});
};

exports.post = post;