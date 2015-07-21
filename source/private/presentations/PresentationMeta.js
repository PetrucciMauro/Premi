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
		console.log("mongo");
		if(err) throw err;

		db.collection('presentations'+req.user).find().toArray(function(err, doc){
			if(err) throw err;
			console.log("no error "+req.user);
			message = [];
			doc.forEach(function(pres){
				message.push(pres);
			});
			console.log(message);
			res.json({
				success: true,
				message: message
			});
			db.close();

		});
	});
};

exports.get = get;