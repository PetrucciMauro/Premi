var Registration = function(hostname){
	
	// private_fields
	var host = hostname;
	//public_fields
	var that = {};
	//public_methods
	that.register = function(user, password){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/register', false);
		req.setRequestHeader("authorization", user+":"+password);
		req.send();
		var serverResponse = JSON.parse(req.responseText);
		messageState = serverResponse.message;
		return serverResponse.success;
	};
	that.getMessage = function(){
		return messageState;
	};

	return that;
};

