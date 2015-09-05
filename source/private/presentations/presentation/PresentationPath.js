/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : source/private/presentations/presentation/PresentationPath.js
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
var put = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
                      if(err) {
                      
                      console.log(err);
                      res.status(400);
                      res.json({
                               success: false,
                               message: err
                               });

                      
                      }
							  
							  var name_pres = req.originalUrl.split("/")[4];
                var re = new RegExp("%20", 'g');
                var name_pres = name_pres.replace(re, " ");
							  var new_element = req.body.element;
							  var to_set = {};
							  to_set["proper.paths"] = new_element;
							  
							  var query = {"meta.titolo": name_pres};
							  
							  db.collection('presentations'+req.user).update( {"meta.titolo" : name_pres}, {"$set" : {"proper.paths" : new_element} }, function(err, doc){
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
																										  });
																							  db.close();
																							 });
							  });
};

exports.put = put;