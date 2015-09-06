/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : source/account/Authenticate.js
 *
 */

//==============
// configuration
//==============

var jwt    = require('jsonwebtoken');
var config = require('../../config');
var database = config.database;
var secret = config.secret;
var MongoClient = require('mongodb').MongoClient;

//=========
// resource
//=========

var get = function(req, res) {
	var header=req.headers['authorization']||'null';
	parts=header.split(/:/);
	user=parts[0];
	pass=parts[1];
	
	MongoClient.connect(database, function(err, db) {
                if(err) {
                      console.log(err);
                      res.status(500);
                      res.json({
                               success: false,
                               message: err
                               });

                }
							  
							  db.collection('users').findOne({'username': user, 'password': pass}, function(err, doc) {
                                    if(err) {
                                               console.log(err);
                                               res.status(500);
                                               res.json({
                                                        success: false,
                                                        message: err
                                                        });
                                    }
																		if(doc == null){
																		
																		res.status(400);
																		res.json({
																					success: false,
                                          message: "no user found or password not corrected"
																					});
																		}
																		else{
																		var token = jwt.sign({user: user}, secret, {
																									expiresInMinutes: 1440 // minutes
                                                         });
																		
																		res.writeHead(200, {"Content-Type": "application/json", "authorization": token});
																		var json = JSON.stringify({
																										  success: true,
                                                      message: "ok"
																										  });
																		res.end(json);
																		}
																		db.close();
																		});
							  
							  console.dir('called findOne()');
																					});
	
};

exports.get = get;