/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : source/private/presentations/new/NewCopyPresentation.js
 *
 */
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
                if(err) {
                      console.log(err);
                      res.status(400);
                      res.json({
                               success: false,
                               message: err
                               });

                }
							  var name_pres = req.originalUrl.split("/")[5];
                var re = new RegExp("%20", 'g');
                var name_pres = name_pres.replace(re, " ");
							  var name_tocopy = req.originalUrl.split("/")[6];
                var re = new RegExp("%20", 'g');
                var name_tocopy= name_tocopy.replace(re, " ");
                      
							  db.collection('presentations'+req.user).findOne({'meta.titolo' : name_pres},function(err, doc){
																							  if(doc != null){
																							  res.json({success : false});
																							  db.close();
																							  }
																							  else{
																							  db.collection('presentations'+req.user).findOne({ 'meta.titolo': name_tocopy }, function(err, doc){
                                                                                if(err) {
                                                                                        console.log(err);
                                                                                        res.status(400);
                                                                                        res.json({
                                                                                                  success: false,
                                                                                                  message: err
                                                                                                  });

                                                                                }
																																							  var new_presentation = doc;
																																							  new_presentation.meta.titolo = name_pres;
																																							  delete new_presentation._id;
																																							  db.collection('presentations'+req.user).insert(new_presentation, function(err, result){
                                                                                                                if(err) {
                                                                                                                        console.log(err);
                                                                                                                        res.status(400);
                                                                                                                        res.json({
                                                                                                                                success: false,
                                                                                                                                message: err
                                                                                                                                });
                                                                                                                        }
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