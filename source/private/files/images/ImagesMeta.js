//==============
// configuration
//==============

var fs = require('fs');

//=========
// resource
//=========
var get = function(req, res){ // scorri tutti i file nella cartella e ritorna una json dei nomi
	console.log("ciao");
	var file_names = fs.readdirSync(__dirname+'/../../../../files/'+req.user+'/image');
	console.log(file_names);
	console.log("ciao");
	var json = JSON.stringify({
		success: true,
		message: 'correctly get files names',
		names: file_names
	});
	res.end(json);
};

exports.get = get;