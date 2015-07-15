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
		messageState = serverResponse.message;
		return serverResponse.success;
		return
	};
	that.getMessage = function(){
		return messageState;
	};
	
	return that;
};

