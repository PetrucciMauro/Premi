/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : source/private/presentations/new/NewPresentation.js
 *
 */

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
							  
							  db.collection('presentations'+req.user).findOne({'meta.titolo' : name_pres},function(err, doc){
                                                        if(err) {
                                                        console.log(err);
                                                        res.status(400);
                                                        res.json({
                                                                  success: false,
                                                                  message: err
                                                                  });

                                                        }
																							  if(doc != null){ res.json({success : false}); db.close();
																						  }
																						  else{
																						  console.log(doc);
																							  var proper = { 'paths': {'main': [], 'choices': []}, 'texts': [], 'frames': [], 'images': [], 'SVGs': [], 'audios': [], 'videos': [], 'background' : {'id' : 0} };
																						  var new_presentation = {'meta': {'titolo': name_pres}, 'proper': proper };
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
																						  }
																						  });
							  });
};

exports.post = post;