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
							  var name_pres = req.originalUrl.split("/")[4];
							  
							  var type_element = req.originalUrl.split("/")[6];
							  var id_element = req.originalUrl.split("/")[7];
							  
							  console.log(type_element);
							  console.log(id_element);
							  
							  var field_path = "";
							  
							  switch(type_element) {
							  case 'text':
							  field_path = 'proper.texts';
							  break;
							  case 'frame':
							  field_path = 'proper.frames';
							  break;
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
							  var to_pull = {};
							  var to_id = {};
							  //var id_element = parseInt(id_element, 10);
							  console.log(id_element);
							  to_id["id"] = id_element;
							  to_pull[field_path] = to_id;
							  console.log(to_pull);
							  
							  db.collection('presentations'+req.user).update({'meta.titolo': name_pres}, { $pull : to_pull }, function(err, doc){
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