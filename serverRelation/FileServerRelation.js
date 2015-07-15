var FileServerRelation = function(hostname, auth_obj){
	
	// private_fields
	var messageState = 'null';
	var host = hostname;
	var auth = auth_obj;
	
	//public_fields
	var that = {};
	
	//public_methods
	that.getImagesMeta = function(){
		var req = new XMLHttpRequest();
		req.open('GET', host+'/private/api/files/image', false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.names;
	};
	
	that.getAudiosMeta = function(){
		var req = new XMLHttpRequest();
		req.open('GET', host+'/private/api/files/audio', false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.names;
	};
	
	that.getVideosMeta = function(){
		var req = new XMLHttpRequest();
		req.open('GET', host+'/private/api/files/video', false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.names;
	};
	
	that.deleteImage = function(filename){
		var req = new XMLHttpRequest();
		req.open('DELETE', host+'/private/api/files/image/'+filename, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.deleteAudio = function(filename){
		var req = new XMLHttpRequest();
		req.open('DELETE', host+'/private/api/files/audio/'+filename, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.deleteVideo = function(filename){
		var req = new XMLHttpRequest();
		req.open('DELETE', host+'/private/api/files/video/'+filename, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.renameImage = function(filename, new_name){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/private/api/files/image/'+filename+'/'+new_name, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.renameAudio = function(filename, new_name){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/private/api/files/audio/'+filename, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.renameVideo = function(filename, new_name){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/private/api/files/video/'+filename, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.getMessage = function(){
		return messageState;
	};
	
	return that;
};

