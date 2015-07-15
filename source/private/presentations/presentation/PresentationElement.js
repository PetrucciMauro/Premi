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
							  var id_pres = req.originalUrl.split("/")[4];
							  var id_element = req.body.id;
							  
							  var objectId_pres = new ObjectID(id_pres);
							  var new_element = req.body.element;
							  
							  var field_path;
							  
							  switch(new_element.type) {
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
							  var path_to_id_element = field_path+'.id';
							  var path_to_element = field_path/*+'.$'*/;
							  var to_set = {};
							  to_set[path_to_element] = new_element;
							  
							  db.collection('presentations'+req.user).update({'_id': objectId_pres, path_to_id_element : id_element}, {$set: to_set }, function(err, doc){
																							 if(err) throw err;
																							 
																							 res.json({
																										 success: true,
																										 message: 'element replaced'
																										 });
																							 db.close();
																							 });
							  });
};

var post = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
							  if(err) throw err;
							  var id_pres = req.originalUrl.split("/")[4];
							  var id_element = req.body.id;
							  
							  var objectId_pres = new ObjectID(id_pres);
							  var new_element = req.body.element;
							  if(new_element == null){ res.json({
																			success: false,
																			message: 'body.element not sent'
																			});
							  return;
							  }
							  
							  var field_path;
							  
							  switch(new_element.type) {
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
							  var to_push = {};
							  to_push[field_path] = new_element;
							  
							  db.collection('presentations'+req.user).update({'_id': objectId_pres}, {$push : to_push},{'upsert' : true},  function(err, doc){
																							 if(err) throw err;
																							 
																							 res.json({
																										 success: true,
																										 message: 'element inserted '+new_element.type																																																																																																			});
																							 db.close();
																							 });
							  });
};

exports.put = put;
exports.post = post;


