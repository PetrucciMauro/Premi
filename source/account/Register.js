//==============
// configuration
//==============

var config = require('../../config');
var database = config.database;
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

//=========
// resource
//=========
var post = function(req, res) {
	var header=req.headers['authorization']||'null';
	parts=header.split(/:/);
	user=parts[0];
	pass=parts[1];
	
	MongoClient.connect(database, function(err, db) {
							  if(err) throw err;
							  db.collection('users').findOne({'username': user}, function(err, doc) {
																		if(err) throw err;
																		if(doc == null){
																		db.collection('users').insert({'username': user, 'password': pass}, function(err, doc){
																												if(err) throw err;
																												console.dir('called insert()');
																												res.json({
																															success: true,
																															message: 'User '+user+' registered'
																															});
																												fs.mkdirSync(__dirname+'/../../files/'+user);
																												fs.mkdirSync(__dirname+'/../../files/'+user+'/image');
																												fs.mkdirSync(__dirname+'/../../files/'+user+'/video');
																												fs.mkdirSync(__dirname+'/../../files/'+user+'/audio');
																												});
																		}
																		else{
																		res.status(400);
																		res.json({
																					success: false,
																					message: 'Username already registered'
																					});
																		}
																		
																		});
							  });
};


exports.post = post;