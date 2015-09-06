/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : source/private/presentations/presentation/Presentation.js
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
var get = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
                      if(err) {
                      
                      console.log(err);
                      res.status(500);
                      res.json({
                               success: false,
                               message: err
                               });

                      
                      }
							  var name_pres = req.originalUrl.split("/")[4];
                var re = new RegExp("%20", 'g');
                var name_pres = name_pres.replace(re, " ");
                      
							  db.collection('presentations'+req.user).findOne({ 'meta.titolo': name_pres }, function(err, doc){
                                                if(err) {
                                                
                                                                console.log(err);
                                                                res.status(500);
                                                                res.json({
                                                                         success: false,
                                                                         message: err
                                                                         });

                                                                
                                                }
                                                res.status(200);
																							  res.json({
																										  success: true,
																										  message: doc
																										  });
																							  db.close();
																							  
																							  });
							  });
};

var del = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
                      if(err) {
                      
                      console.log(err);
                      res.status(500);
                      res.json({
                               success: false,
                               message: err
                               });
                      }
							  var name_pres = req.originalUrl.split("/")[4];
                var re = new RegExp("%20", 'g');
                var name_pres = name_pres.replace(re, " ");
                      
							  db.collection('presentations'+req.user).remove({ 'meta.titolo': name_pres }, function(err, removed){
                                              if(err) {
                                                               console.log(err);
                                                               res.status(500);
                                                               res.json({
                                                                        success: false,
                                                                        message: err
                                                                        });
                 
                                              }
                                               res.status(200);
																							 res.json({
																										 success: true,
																										 message: 'removed presentation: '+name_pres
																										 });
																							 db.close();
																							 
																							 });
							  });
};

exports.get = get;
exports.delete = del;