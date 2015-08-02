var MongoRelation = function(hostname, auth_obj){
	
	// private_fields
	var messageState = 'null';
	var host = hostname;
	var auth = auth_obj;
	
	//public_fields
	var that = {};
	
	//public_methods
	that.getPresentationsMeta = function(){
		var req = new XMLHttpRequest();
		req.open('GET', host+'/private/api/presentations', false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.message;
	};
	
	that.newPresentation = function(nameNewPresentation){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/private/api/presentations/new/'+nameNewPresentation, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.id_pres;
	};
	
	//... rename presentation
	
	that.getPresentation = function(nameNewPresentation){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/private/api/presentations/'+nameNewPresentation, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.message;
	};
	
	that.deletePresentation = function(presentation_id){
		var req = new XMLHttpRequest();
		req.open('DELETE', host+'/private/api/presentations/'+presentation_id, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.message;
	};
	
	that.renamePresentation = function(name_presentation, new_name){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/private/api/presentations/'+name_presentation+'/'+new_name, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.updateElement = function(name_presentation, element_updated){
		var req = new XMLHttpRequest();
		req.open('PUT', host+'/private/api/presentations/'+name_presentation+'/element', true);
		req.setRequestHeader("Authorization", auth.getToken());
		req.setRequestHeader("Content-type", "application/json");
		req.send(JSON.stringify({"element": element_updated}));
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.deleteElement = function(name_presentation, id_element){
		var req = new XMLHttpRequest();
		req.open('DELETE', host+'/private/api/presentations/'+name_presentation+'/'+id_element, true);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};

	that.newElement = function(name_presentation, new_element){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/private/api/presentations/'+name_presentation+'/element', true);
		req.setRequestHeader("Authorization", auth.getToken());
		req.setRequestHeader("Content-type", "application/json");
		req.send(JSON.stringify({"element": new_element}));
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.getMessage = function(){
		return messageState;
	};
	
	return that;
};

