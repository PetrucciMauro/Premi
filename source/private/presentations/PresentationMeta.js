/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : source/private/presentations/PresentationMeta.js
 *
 */

//==============
// configuration
//==============

var config = require('../../../config');
var database = config.database;
var MongoClient = require('mongodb').MongoClient;

//=========
// resource
//=========
var get = function(req, res){
	
	MongoClient.connect(database, function(err, db) {
                if(err) {
                      console.log(err);
                      res.status(400);
                      res.json({
                               success: false,
                               message: err
                               });

                }
							  
							  db.collection('presentations'+req.user).find().toArray(function(err, doc){
                                                    if(err) {
                                                            console.log(err);
                                                            res.status(400);
                                                            res.json({
                                                                    success: false,
                                                                    message: err
                                                                    });

                                                    }
																										message = [];
																										doc.forEach(function(pres){
																														message.push(pres.meta);
																														});
																										
																										res.json({
																													success: true,
																													message: message
																													});
																										db.close();
																										
																										});
							  });
};

exports.get = get;