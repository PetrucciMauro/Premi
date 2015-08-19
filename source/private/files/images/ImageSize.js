//==============
// configuration
//==============

var fs = require('fs');
//
var gm = require('gm');

//=========
// resource
//=========
var get = function(req, res){ // scorri tutti i file nella cartella e ritorna una json dei nomi
    
    var fileName = req.originalUrl.split("/")[5];
    
    gm('/../../../../files/'+req.user+'/image/'+fileName).size(function (err, size) {
                         if (!err) {
                         res.status('200');
                         res.json({
                                 'height' : size.width,
                                 'width' : size.height
                                 });
                        }
                }
};

exports.get = get;