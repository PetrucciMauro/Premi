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
  var user = req.originalUrl.split("/")[2];
  
	var options = {
	root: __dirname + '/../../../../files/'+user+'/image',
	dotfiles: 'deny',
	headers: {
		'x-timestamp': Date.now(),
		'x-sent': true
	}
	};
	
	
	var there_is = fs.existsSync(__dirname+'/../../../../files/'+user+'/image/'+file_name);
	
	if(there_is == false){
		res.status(404).send({
									success: false,
									message: 'File not found'
									});
	}
	else{
		res.sendFile(file_name, options, function (err) {
						 if (err) {
						 console.log(err);
						 res.status(err.status).end();
						 }
						 else {
						 console.log('Sent:', file_name);
						 }
						 });
	}
};

exports.get= get;

















