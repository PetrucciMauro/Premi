var Registration = function(hostname){
	
	// private_fields
	var messageState = 'null';
	var host = hostname;
	//public_fields
	var that = {};
	//public_methods
	that.register = function(user, password){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/account/register', false);
		req.setRequestHeader("Authorization", user+":"+password);
		req.send();
		var serverResponse = JSON.parse(req.responseText);
		messageState = serverResponse.success;
		return serverResponse.success;
	};
	that.getMessage = function(){
		return messageState;
	};
	
	return that;
	
};

exports.Registration = Registration;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;