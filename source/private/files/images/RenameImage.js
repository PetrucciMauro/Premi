/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : source/private/files/images/RenameImage.js
 *
 */
//==============
// configuration
//==============

var fs = require('fs');

//=========
// resource
//=========
var post = function(req, res){
	
	var dir= __dirname+'/../../../../files/'+req.user+'/image/';
	var name = req.originalUrl.split("/")[5];
  var re = new RegExp("%20", 'g');
  var name = name.replace(re, " ");
  var new_name = req.originalUrl.split("/")[6];
  var re = new RegExp("%20", 'g');
  var new_name = new_name.replace(re, " ");
	var there_is = fs.existsSync(dir+name);
	if(there_is){
		fs.renameSync(dir+name, dir+new_name);
		res.json({
											success: true,
											message: 'correctly renamed file '+dir+name+' in '+dir+new_name
											});
		
	}
	else{
		res.json({
											success: false,
											message: 'file '+dir+name+' does not exists'
											});
	}
};

exports.post = post;