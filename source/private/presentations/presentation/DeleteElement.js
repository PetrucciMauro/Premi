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
var del = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
																					if(err) throw err;
																					var id_pres = req.originalUrl.split("/")[4];
																					var type_element = req.originalUrl.split("/")[6];
																					var id_element = req.originalUrl.split("/")[7];
																					
																					var objectId_pres = new ObjectID(id_pres);
																					var field_path;
																					
																					switch(type_element) {
																					case 'text':
																					field_path = 'proper.texts';
																					break;
																					case 'frame':
																					field_path = 'proper.frames';
																					case 'image':
																					field_path = 'proper.images';
																					break;
																					case 'SVG':
																					field_path = 'proper.SVGs';
																					break;
																					case 'audio':
																					field_path = 'proper.audios';
																					break;
																					case 'video':
																					field_path = 'proper.videos';
																					break;
																					case 'background':
																					field_path = 'proper.background';
																					break;
																					default:
																					res.json({
																														success: true,
																														message: 'element type: '+type_element+' not known'
																														});
																					return;
																					}
																					
																					db.collection('presentations'+req.user).update({'_id': objectId_pres}, {$pull : {field_path : {"id" : id_element}}}, function(err, doc){
																																																																				if(err) throw err;
																																																																				res.json({
																																																																													success: true,
																																																																													message: 'deleted element'
																																																																													});
																																																																				db.close();
																																																																				});
																					});
};


exports.delete = del;