var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

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
		return res.success;
	};
	
	that.newCopyPresentation = function(nameOldPresentation,nameNewPresentation){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/private/api/presentations/new/'+nameOldPresentation+nameNewPresentation, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.getPresentation = function(namePresentation){
		var req = new XMLHttpRequest();
		req.open('GET', host+'/private/api/presentations/'+namePresentation, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.message;
	};
	
	that.deletePresentation = function(namePresentation){
		var req = new XMLHttpRequest();
		req.open('DELETE', host+'/private/api/presentations/'+namePresentation, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.renamePresentation = function(name_presentation, new_name){
		var req = new XMLHttpRequest();
		req.open('POST', host+'/private/api/presentations/'+name_presentation+'/rename/'+new_name, false);
		req.setRequestHeader("Authorization", auth.getToken());
		req.send();
		var res = JSON.parse(req.responseText);
		messageState = res.success;
		return res.success;
	};
	
	that.updateElement = function(name_presentation, element_updated, callback){
		
		var req = new XMLHttpRequest();
		req.open("PUT", host+'/private/api/presentations/'+name_presentation+'/element', true);
		req.setRequestHeader("Authorization", auth.getToken());
		req.setRequestHeader("Content-Type", "application/json");
		var objSend = {}; objSend["element"] = element_updated;
		req.onload = function (e) {
			var res = JSON.parse(req.responseText);
			messageState = res.success;
			//return res.success;
			callback();
		};
		req.send(JSON.stringify(objSend));
	};
	
	that.deleteElement = function(name_presentation, typeObj, id_element, callback){
		var req = new XMLHttpRequest();
		req.open("DELETE", host+'/private/api/presentations/'+name_presentation+'/delete/'+typeObj+'/'+id_element, true);
		req.setRequestHeader("Authorization", auth.getToken());
		req.onload = function (e) {
			var res = JSON.parse(req.responseText);
			messageState = res.success;
			//return res.success;
			callback();
		};
		req.send();
	};
	 

	that.newElement = function(name_presentation, new_element, callback){
		
		var req = new XMLHttpRequest();
		req.open("POST", host+'/private/api/presentations/'+name_presentation+'/element', true);
		req.setRequestHeader("Authorization", auth.getToken());
		req.setRequestHeader("Content-Type", "application/json");
		var objSend = {}; objSend["element"] = new_element;
		req.onload = function (e) {
			var res = JSON.parse(req.responseText);
			messageState = res.success;
			//return res.success;
			callback();
		};
		req.send(JSON.stringify(objSend));
	};
	
	that.updatePaths = function(name_presentation, elementPath, callback){
		var req = new XMLHttpRequest();
		req.open("PUT", host+'/private/api/presentations/'+name_presentation+'/paths', true);
		req.setRequestHeader("Authorization", auth.getToken());
		req.setRequestHeader("Content-Type", "application/json");
		var objSend = {}; objSend["element"] = elementPath;
		req.onload = function (e) {
			var res = JSON.parse(req.responseText);
			messageState = res.success;
			//return res.success;
			callback();
		};
		req.send(JSON.stringify(objSend));
	};
	
	that.getMessage = function(){
		return messageState;
	};
	
	return that;
};

exports.MongoRelation = MongoRelation;

