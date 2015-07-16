var ChangePassword = function(hostname){
	
	// private_fields
	var host = hostname;
	//public_fields
	var that = {};
	//public_methods
	that.changepassword = function(user, password, newpassword){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/changepassword', false);
		req.setRequestHeader("authorization", user + ":" + password + ":" + newpassword);
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.message;
		return res.success;
	};
	that.getMessage = function(){
		return messageState;
	};
	
	return that;
};

