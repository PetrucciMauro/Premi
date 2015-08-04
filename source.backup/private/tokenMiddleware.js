//==============
// configuration
//==============

var config = require('../../config');
var database = config.database;
var secret = config.secret;
var MongoClient = require('mongodb').MongoClient;
var jwt    = require('jsonwebtoken');

//=========
// resource
//=========
var use = function(req, res, next) {
	console.log("Middleware");
	console.log(req.headers);
	var token=req.headers['authorization'];
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, secret, function(err, decoded) {
			console.log(token);
			console.log(err);
			if (err) {
				res.status(400);
				return res.json({ success: false, message: 'Failed to authenticate token' });
			} else {
				req.user = decoded.user;
				next();
			}
		});
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
};

exports.use = use;