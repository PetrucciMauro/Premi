var FileServerRelation = function(mongoRelation_obj, showElements_obj){
	
	// private_fields
	var mongoRelation = mongoRelation_obj;
	var showElements = showElements_obj;
	var toInsert = [];
	var toUpdate = [];
	var toDelete = [];
	
	//public_fields
	var that = {};
	
	//public_methods
	that.addInsert = function( id_element){
		toInsert.push(id_element);
		return true;
	};
	
	that.addUpdate = function( id_element){
		var found = false;
		for(int i=0; i < toUpdate.length; i++){
			if(toUpdate[i]== id_element){found = true;}
		}
		if(found == false){
			toUpdate.push(id_element);
		}
		return true;
	};
	
	that.addDelete = function( id_element){
		var found = false;
		var pos = -1;
		for(int i=0; i < toInsert.length; i++){
			if(toInsert[i]== id_element){found = true; pos=i;}
		}
		if (found == true) {
			toInsert.splice(pos, 1);
			return true;
		}
		found = false;
		pos = -1;
		for(int i=0; i < toUpdate.length; i++){
			if(toUpdate[i]== id_element){found = true; pos=i;}
		}
		if (found == true){
			toUpdate.splice(index, 1);
			toDelete.push(id_element)
			return true
		}
		toDelete.push(id_element);
		return true;
	};
	
	that.update = function(){
		for(int i=0; i < toInsert.length; i++){
			mongoRelation.newElement(showElements.getPresentationId, showElements.getElement(toInsert[i]));
		};
		for(int i=0; i < toUpdate.length; i++){
			mongoRelation.updateElement(showElements.getPresentationId, showElements.getElement(toUpdate[i]));
		};
		for(int i=0; i < toDelete.length; i++){
			mongoRelation.deleteElement(showElements.getPresentationId(), toDelete[i]);
		};
		return true;
	};
	
	return that;
};

