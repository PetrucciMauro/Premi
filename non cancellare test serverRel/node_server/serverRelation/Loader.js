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
		/*var found = false;
		for(var i=0; i < toDelete.length; i++){
			if(toDelete[i].id == id_element){found = true; pos=i;}
		}
		if (found == true) {
			toDelete.splice(pos, 1);
			toUpdate.push(id_element);
			return true;
		}
		else{*/
			toInsert.push(id_element);
		//}
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
		
		var count_insert = toInsert.length;
		var count_delete = toDelete.length;
		var count_update = toUpdate.length;
		var count_paths = 0;
		if(toPaths){count_paths = 1;}
		
		var test_obj = function(callback){
			var that = {};
			
			var counter_test = count_insert + count_update + count_paths;
			
			that.done = function(){
				counter_test--;
				if(counter_test == 0){
					callback();
				}
			};
			return that;
		};
		
		var delete_callback = function(callback){
			var that = {};
			var counter_del = count_delete;
			that.done = function(){
				counter_del--;
				if(counter_del == 0){
					callback();
				}
			};
			return that;
		};
		
		var toCall = test_obj(call);
		var toCallDelete = delete_callback( function(){
													  
													  for(var i=0; i < count_insert; i++){
													  mongoRelation.newElement(showElements.getPresentationName(), showElements.getElement(toInsert[0]), toCall.done);
													  toInsert.shift();
													  };
													  for(var i=0; i < count_update; i++){
													  mongoRelation.updateElement(showElements.getPresentationName(), showElements.getElement(toUpdate[0]), toCall.done);
													  toUpdate.shift;
													  };
													  
													  if(count_paths == 1){ mongoRelation.updatePaths(showElements.getPresentationName(), showElements.getPaths(), toCall.done); };
													  
													  return true;
													  });
		if(count_delete>0){
			for(var i=0; i < count_delete; i++){
				mongoRelation.deleteElement(showElements.getPresentationName(), toDelete[0].type, toDelete[0].id, toCallDelete.done);
				toDelete.shift();
			};
		} else{
			
			for(var i=0; i < count_insert; i++){
				mongoRelation.newElement(showElements.getPresentationName(), showElements.getElement(toInsert[0]), toCall.done);
				toInsert.shift();
			};
			for(var i=0; i < count_update; i++){
				mongoRelation.updateElement(showElements.getPresentationName(), showElements.getElement(toUpdate[0]), toCall.done);
				toUpdate.shift;
			};
			
			if(count_paths == 1){ mongoRelation.updatePaths(showElements.getPresentationName(), showElements.getPaths(), toCall.done); };
			
			return true;
		}
	};
	
	return that;
};

exports.Loader = Loader;

