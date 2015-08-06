//==============
// configuration
//==============

var fs = require('fs');

//=========
// resource
//=========
var get = function(req, res){
	var file_names = fs.readdirSync(__dirname+'/../../../../files/'+req.user+'/video');
	res.json({
										success: true,
										message: 'correctly get files names',
										names: file_names
										});
};


exports.get = get;