var Authentication = function(hostname){
	
	// private_fields
	var token = 'null';
	var host = hostname;
	//public_fields
	var that = {};
	//public_methods
	that.authenticate = function(user, password){
		var req = new XMLHttpRequest();
		req.open('GET', host+'/account/authenticate', false);
		req.setRequestHeader("Authorization", user+":"+password);
		req.send();
		var res = JSON.parse(req.responseText);
		token = req.getResponseHeader("Authorization");
		messageState = res.success;
		return res.success;
	};
	that.getMessage = function(){
		return messageState;
	};
	that.getToken = function(){
		return token;
	};
	that.deAuthenticate = function(){
		token = 'null';
		return true;
	};
	
	return that;
};

