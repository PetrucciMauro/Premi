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
							  if(err) throw err;
							  
							  db.collection('users').findOne({'username': user, 'password': pass}, function(err, doc) {
																		if(err) throw err;
																		if(doc == null){
																		db.close();
																		res.status(400);
																		res.json({
																					success: false,
																					message: 'Username or password incorrect'
																					});
																		}
																		else{
																		var token = jwt.sign({user: user}, secret, {
																									expiresInMinutes: 1440 // expires in 24 hours
																									});
																		
																		res.writeHead(200, {"Content-Type": "application/json", "authorization": token});
																		var json = JSON.stringify({
																										  success: true,
																										  message: 'Enjoy your token!',
																										  });
																		res.end(json);
																		}
																		});
							  
							  console.dir('called findOne()');
																					});
	
};

exports.get = get;