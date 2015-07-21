//==============
// configuration
//==============

var fs = require('fs');

//=========
// resource
//=========
var get = function(req, res){ // scorri tutti i file nella cartella e ritorna una json dei nomi
	var file_names = fs.readdirSync(__dirname+'/../../../../files/'+req.user+'/image');
	res.json({
										success: true,
										message: 'correctly get files names',
										names: file_names
										});
};

exports.get = get;