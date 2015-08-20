//==============
// configuration
//==============

var fs = require('fs');
var sizeOf = require('image-size');

//=========
// resource
//=========
var get = function(req, res){ // scorri tutti i file nella cartella e ritorna una json dei nomi
    var fileName = req.originalUrl.split("/")[5];
  
    var dimensions = sizeOf(__dirname+'/../../../../files/'+req.user+'/image/'+fileName);
    res.json({
           'height' : dimensions.width,
           'width' : dimensions.height
    });
};

exports.get = get;