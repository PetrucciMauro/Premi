//==============
// configuration
//==============

var config = require('../../config');
var database = config.database;
var MongoClient = require('mongodb').MongoClient;

//=========
// resource
//=========

var post = function(req, res) {
	console.log("Change pwd");
	console.log(req.headers);
	var header=req.headers['authorization']||'null';
	parts=header.split(/:/);
	user=parts[0];
	pass=parts[1];
	passNew=parts[2];
	
	MongoClient.connect(database, function(err, db) {
		console.log("MongoClient.connect");
		if(err) throw err;
		console.log("MongoClient.connect no error");
		db.collection('users').findOne({'username': user, 'password': pass}, function(err, doc) {
			if(err) throw err;
			if(doc != null){
				db.collection('users').update({'username': user}, {$set: {'password' : passNew }}, function(err, doc){
					if(err) throw err;
					console.dir('called udpate()');
					res.json({
						success: true,
						message: 'Password modificata con successo'
					});
				});
			}
			else{
				res.status(400);
				res.json({
					success: false,
					message: 'Username o password non corretti'
				});
			}
			
		});
	});
};

exports.post = post;