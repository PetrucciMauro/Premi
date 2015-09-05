/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : source/files/GetVideo.js
 *
 */

//==============
// configuration
//==============

var fs = require('fs');
var multer  = require('multer')

//=========
// resource
//=========

// /files/[user]/image/[imagename]
var get = function (req, res) {
	
  var file_name = req.originalUrl.split("/")[4];
  var re = new RegExp("%20", 'g');
  var file_name = file_name.replace(re, " ");
  var user = req.originalUrl.split("/")[2];

  var options = {
	root: __dirname + '/../../../../files/'+user+'/video',
	dotfiles: 'deny',
	headers: {
		'x-timestamp': Date.now(),
		'x-sent': true
	}
	};
	
	//var file_name = req.originalUrl.split("/")[5];
	var there_is = fs.existsSync(__dirname + '/../../../../files/'+user+'/video/'+file_name);
	
	if(there_is == false){
		res.status(404).send({
																							success: false,
																							message: 'File not found'
																							});
	}
	else{
		res.sendFile(file_name, options, function (err) {
															if (err) {
															res.status(err.status).end();
															}
															});
	}
};

exports.get= get;

















