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
	
	var token=req.headers['authorization'];
	if (token) {
		
		// verifies secret and checks exp
		jwt.verify(token, secret, function(err, decoded) {
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