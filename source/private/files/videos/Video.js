/*
 * Name : Pietro Tollot
 * Module : serverNode
 * Location : source/private/files/videos/Video.js
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

var del = function(req, res){
	var dir= __dirname+'/../../../../files/'+req.user+'/video/';
	var name = req.originalUrl.split("/")[5];
  var re = new RegExp("%20", 'g');
  var name = name.replace(re, " ");
	var there_is = fs.existsSync(dir+name);
	
	if(there_is){
		fs.unlinkSync(dir+name);
		res.json({
					success: true,
					message: 'correctly delete file '+dir+name
					});
		
	}
	else{
		res.json({
					success: false,
					message: 'file '+dir+name+' does not exists'
					});
	}
	
};


var post = [ multer({
																				dest: __dirname + '/../../../../files/',
																				
																				changeDest: function(dest, req, res) {
																				var newDestination = dest + req.user + '/video';
																				return newDestination;
																				},
																				
																				
																				rename: function (fieldname, filename, req, res) {
																				var new_name = req.originalUrl.split("/")[5];
                                        var re = new RegExp("%20", 'g');
                                        var new_name = new_name.replace(re, " ");
																				return new_name; }
																				
																				}),
												function(req, res){
												res.status(204).end()
												}];


exports.delete= del;
exports.post = post;
















