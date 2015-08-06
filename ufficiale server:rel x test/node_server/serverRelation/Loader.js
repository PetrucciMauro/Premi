var Loader = function(mongoRelation_obj, showElements_obj){
	
	// private_fields
	var mongoRelation = mongoRelation_obj;
	var showElements = showElements_obj;
	var toInsert = [];
	var toUpdate = [];
	var toDelete = [];
	var toPaths = false;
	
	//public_fields
	var that = {};
	
	//public_methods
	that.addInsert = function( id_element){
		var found = false;
		for(var i=0; i < toDelete.length; i++){
			if(toDelete[i].id == id_element){found = true; pos=i;}
		}
		if (found == true) {
			toDelete.splice(pos, 1);
			toUpdate.push(id_element);
			return true;
		}
		else{
			toInsert.push(id_element);
		}
	};
	
	that.addUpdate = function( id_element){
		var found = false;
		for(var i=0; i < toUpdate.length; i++){
			if(toUpdate[i]== id_element){found = true;}
		}
		if(found == false){
			for(var i=0; i < toInsert.length; i++){
				if(toInsert[i] == id_element){found = true;}
			}
			if(found == false){
				toUpdate.push(id_element);
			}
			return true;
		}
	};
	
	that.addDelete = function(typeObj, id_element){
		var found = false;
		var pos = -1;
		for(var i=0; i < toInsert.length; i++){
			if(toInsert[i]== id_element){found = true; pos=i;}
		}
		if (found == true) {
			toInsert.splice(pos, 1);
			return true;
		}
		found = false;
		pos = -1;
		for(var i=0; i < toUpdate.length; i++){
			if(toUpdate[i]== id_element){found = true; pos=i;}
		}
		if (found == true){
			toUpdate.splice(pos, 1);
			toDelete.push({"id" : id_element, "type" : typeObj});
			return true
		}
		toDelete.push({"id" : id_element, "type" : typeObj});
		return true;
	};
	
	that.addPaths = function(){
		toPaths = true;
	};
	
	that.update = function(call){
		
		var test_obj = function(callback){
			var that = {};
			
			var counter = toDelete.length + toInsert.length + toUpdate.length;
			if(toPaths == true) { counter++; }
			
			that.done = function(){
				counter--;
				if(counter == 0){
					callback();
				}
			};
			return that;
		};
		
		var toCall = test_obj(call);
		
		for(var i=0; i < toInsert.length; i++){
			mongoRelation.newElement(showElements.getPresentationName(), showElements.getElement(toInsert[i]), toCall.done);
		};
		for(var i=0; i < toUpdate.length; i++){
			mongoRelation.updateElement(showElements.getPresentationName(), showElements.getElement(toUpdate[i]), toCall.done);
		};
		for(var i=0; i < toDelete.length; i++){
			mongoRelation.deleteElement(showElements.getPresentationName(), toDelete[i].type, toDelete[i].id, toCall.done);
		};
		if(toPaths == true){ mongoRelation.updatePaths(showElements.getPresentationName(), showElements.getPaths()); };
		toPath = false;
		toDelete = [];
		toInsert = [];
		toUpdate = [];
		return true;
	};
	return that;
};

exports.Loader = Loader;

