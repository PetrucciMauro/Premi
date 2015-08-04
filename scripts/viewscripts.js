//TRADUTTORE NO MODIFICARE
var l=screen.width;
l=l*0.989;
var h=l/2.06666667;
document.getElementById("content").setAttribute("style","border: 1px solid black;position: absolute; width:"+l+"px; height:"+h+"px;");
//TRADUTTORE
var zindex = 0;
var contatore=1;
$(document).ready(function () {
        var origin;
        $("#sortable").sortable({
            start: function(event,ui){
                origin=ui.item.index();
            },
            change: function (event, ui) {
                $(ui.item[0].previousElementSibling).trigger("click");
                $(ui.item[0].nextElementSibling).trigger("click");
                console.log("New position: " + ui.item.index());
            },
            stop: function (event, ui) {
                mainPath().removeFromMainPath(mainPath().getAssociation($(ui.item[0]).attr("id")), origin);
                console.log(mainPath().getAssociation($(ui.item[0]).attr("id")), origin);
                mainPath().addToMainPath(mainPath().getAssociation($(ui.item[0]).attr("id")), ui.item.index());
                console.log("New position: " + ui.item.index());
        }
        });
        $("#sortable").disableSelection();
        
    });

//oggetto che tiene traccia dell'elemento selezionato//
var activeInstance={};
var activeInstanced=false;
var active=function(){
	if(!activeInstanced){
		var that={};
		var private={};
		private.element;
		that.select=function(id){
			clearMenu();
			that.deselect();
			private.element=document.getElementById(id);
			private.element.style.boxShadow= "0 0 0 0.25em black inset";
			document.getElementById("x"+id).style.opacity = '1';
			document.getElementById("x"+id).style.WebkitTransition = 'opacity 0.5s';
			document.getElementById("x"+id).style.MozTransition = 'opacity 0.5s';
			if($("#"+id).zIndex()!=zindex-1){
			    document.getElementById("for"+id).style.opacity = '1';
			    document.getElementById("for"+id).style.WebkitTransition = 'opacity 0.5s';
			    document.getElementById("for"+id).style.MozTransition = 'opacity 0.5s';
			}
			if($("#"+id).zIndex()>0){
				document.getElementById("back"+id).style.opacity = '1';
				document.getElementById("back"+id).style.WebkitTransition = 'opacity 0.5s';
				document.getElementById("back"+id).style.MozTransition = 'opacity 0.5s';
			}
			
			//document.getElementById("rotation").innerHTML="<input id=\"rangeRotation\" type=\"range\" min=\"0\" max=\"360\" step=\"1\" value=\""+getRotationDegrees($("#"+id))+"\" oninput=\"rotate('"+id+"',this.value)\">";
			console.log("gradi " + getRotationDegrees($("#" + id)));
			private.id = id;
			deselezionaPercorso(id);
			selezionaPercorso(id);
			updateDraggable();
			
		};
		that.getId=function(){
			return private.id;
		};
		that.deselect=function(){
			clearMenu();
			console.log(private.id);
			if(document.getElementById(private.id)){
				document.getElementById(private.id).style.boxShadow= "none";
				document.getElementById("x"+private.id).style.opacity = '0';
				document.getElementById("for"+private.id).style.opacity = '0';
				if($(private.element).zIndex()>0){

					document.getElementById("back"+private.id).style.opacity = '0';
				}
				deselezionaPercorso("undefined");
				delete private.id;
			}
		};
		that.getTipo=function(){
			var type;
			if(private.id){
				if($(private.element).hasClass("frame")){
					type="frame";
				}
				else if($(private.element).hasClass("image")){
					type="image";
				}
				else if($(private.element).hasClass("SVG")){
					type="SVG";
				}
				else if($(private.element).hasClass("text")){
					type="text";
				}
				else if($(private.element).hasClass("audio")){
					type="audio";
				}
				else if($(private.element).hasClass("video")){
					type="video";
				}
			}
			return type;
		}
		activeInstance=that;
		activeInstanced=true;
	}
	return activeInstance;
}
//--end oggetto che tiene traccia dell'elemento selezionato--//

function highlight(id) {
   
    if (!$("#"+id).hasClass("highlighted") ){
        $("#"+id).addClass("highlighted");
        console.log("over");
    }
    else
        $("#"+id).removeClass("highlighted");
}



function highlightPath(index) {
    var high = false;
    if ($(choicePaths().getPercorsi[index].path[0].hasClass("highlighted"))){
        high=true;
    }
        for (var i = 0; i < choicePaths().getPercorsi[index].path.length; i++) {
            if(high)
                $(choicePaths().getPercorsi[index].path[i]).removeClass("highlighted");
            else
                $(choicePaths().getPercorsi[index].path[i]).addClass("highlighted");
        }
}



//percorso principale//
var mainPathInstance={};
var mainPathInstanced=false;
var mainPath=function(){
    if(!mainPathInstanced==true)
    {
        mainPathInstanced=true;
        var that={};
        var private={};
        private.percorso=new Array();
        private.associations=new Array();
        that.getPercorso=function(){
            return private.percorso;
        }
        that.addToMainPath = function (id, position) {
            if (!mainPath().contains(id)) {
                var pos = position || private.percorso.length;
                private.percorso.splice(pos, 0, id);
                var s = "";
                for (var i = 0; i < private.percorso.length; i++) {
                    s = s + " " + private.percorso[i];
                }
                document.getElementById("addToMain").removeAttribute("onclick");
                selezionaPercorso(id);
            }
        };
        
        

        that.removeFromMainPath=function(id){
            var index = new Array();
            var position;
            var found = false;
            console.log("sort " + id+ $("#sort"+id).length);
            if ($("#sort" + id).length) {
                console.log("sort " + id);
                $("#sort" + id).remove();
            }
            $("#" + id).removeClass("highlighted");
			for(var i = 0; i<private.percorso.length && !found; i++){
				if (private.percorso[i]==id){
				    position=i;
				    found = true;
				}
			}
			
			var popped;
			
			popped = private.percorso.splice(position, 1);
			var s = "";
				for (var i = 0; i < private.percorso.length; i++) {
				    s = s + " " + private.percorso[i];
				}
				document.getElementById("mainp").innerHTML = s;
				document.getElementById("addToMain").setAttribute("onclick", "mainPath().addToMainPath(" + popped.id + ")");;
				document.getElementById(id).style.removeProperty('border');
			return popped;
		};

		that.setPath = function (newPath) {
		    private.percorso.length=0;
		    private.percorso = newPath;
		    var s = "";
		    for (var i = 0; i < private.percorso.length; i++) {
		        s = s + " " + private.percorso[i];
		    }
		    document.getElementById("mainp").innerHTML = s;
		}

		that.deleteFrame=function(id){
		    if ($("#sort" + id).length) {
		        console.log("sort " + id);
		        $("#sort" + id).remove();
		    }
			for(var i = 0; i<private.percorso.length; i++){
				if (private.percorso[i]==id){
					private.percorso.splice(i, 1);
					i--;
				}
			}
		};

		that.contains = function (id) {
		    var contiene = false;
		    if (private.percorso.indexOf(id) > -1) {

		        contiene = true;
		    }
		    return contiene;
		};

		private.flag = false;
		that.getFlag = function () {
		    return private.flag;
		}
		that.setFlag = function (status) {
		    private.flag = status;
		}
		
		that.pushAssociation = function (obj) {
		   private.associations.push(obj);
		}

		that.getAssociation = function (id) {
		    var found = false;
		    var value;
		    for (var i = 0; i < private.associations.length && !found; ++i) {
		        if (private.associations[i].id === id) {
		            value = private.associations[i].association;
		            found = true;
		        }
		    }
            return value
		}
		mainPathInstance=that;
	}

	return mainPathInstance;
}
//--end percorso principale --//



//percorsi scelta//
var choicePathsInstance={};
var choicePathsInstanced=false;
var choicePaths=function(){
	if(!choicePathsInstanced==true)
	{

		choicePathsInstanced=true;
		var that={};
		var private={};
		private.percorsi=new Array();
		that.getPercorsi=function(){
			return private.percorsi;
		}
		that.createChoicePath=function(){
			var newId;

			if (choicePaths.length>0){
				newId=private.percorsi[length-1].path.pathId+1;
			}
			else 
				newId=0;
			obj={};
			obj.pathId=newId;
			obj.path=new Array();
			var colore="FF0000";
			while(colore==="FF0000"){
				colore=Math.floor(Math.random()*16777215).toString(16);
			}
			obj.selectionColor=colore;
			private.percorsi.push(obj);
		};

		that.addToChoicePath=function(id, pathId, position){
			var pos;
			var index;

			for(var i=0; i<private.percorsi.length; i++){
				if (private.percorsi[i].pathId==pathId){
					pos=position || private.percorsi[i].path.length;
					index=i;
				}
			}
			private.percorsi[index].path.splice(pos, 0, id);
			deselezionaPercorso(id);
			selezionaPercorso(id);
		};

		that.deleteChoicePath=function(index){
			private.percorsi.splice(index,1);
		};

		that.removeFromChoicePaths = function (id, position) {
		    
			for(var i=0; i<private.percorsi.length; i++){

				var index=new Array();
				for(var j = 0; j<private.percorsi[i].path.length; j++){
					if (private.percorsi[i].path[j]==id){
						index.push(j);
					}
				}
				var pos=position || index[index.length-1];
				var popped;
				if(index.length){
					popped=private.percorsi[i].path.splice(pos, 1);
				}
			}
			return popped;
		};

		that.deleteFrame=function(id){
			for(var i = 0; i<private.percorsi.length; i++){
				for(var j = 0; i<private.percorsi[i].path.length; j++){
					if (private.percorsi[i].path[j]==id){
						private.percorsi[i].path[j].splice(i, 1);
						j--;
					}
				}
			}
		};
		choicePathsInstance=that;
	}
	return choicePathsInstance;
}
//--end percorsi scelta--//



function getRotationDegrees(obj) {

	var matrix = obj.css("-webkit-transform") ||
	obj.css("-moz-transform")    ||
	obj.css("-ms-transform")     ||
	obj.css("-o-transform")      ||
	obj.css("transform");
	if(matrix !== 'none') {
		var values = matrix.split('(')[1].split(')')[0].split(',');
		var a = values[0];
		var b = values[1];
		var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
	} else { var angle = 0; }
	return (angle < 0) ? angle + 360 : angle;
}

function rotate(el,value) {
	document.getElementById(el).style.webkitTransform="rotate(" + value + "deg)";
	document.getElementById(el).style.msTransform="rotate(" + value + "deg)";
	document.getElementById(el).style.MozTransform="rotate(" + value + "deg)";
	document.getElementById(el).style.OTransform="rotate(" + value + "deg)";
	document.getElementById(el).style.transform="rotate(" + value + "deg)";
};








function clearMenu(){
	var hideEles = document.getElementById("contextual-menu").children;
	for(var i = 0; i < hideEles.length; i++) {
		if(hideEles[i].id!="slideShowMenu" && hideEles[i].id!="percorsi")
			hideEles[i].style.display="none";
	}
}

function elimina(id) {
    var frames = document.getElementById("frames").children;
    for (var i = 0; i < frames.length; i++) {
        if (frames[i].style.getPropertyValue("z-index") > document.getElementById(id).style.getPropertyValue("z-index")) {
            frames[i].style.zIndex = frames[i].style.zIndex - 1;
        }
    }

    var elements = document.getElementById("elements").children;
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].style.getPropertyValue("z-index") > $("#" + id).style.zIndex) {
            elements[i].style.zIndex = elements[i].style.zIndex - 1;
        }
    }

    zindex--;
	if($("#"+id).hasClass("frame")){

		mainPath().deleteFrame(id);
		choicePaths().deleteFrame(id);
	}
	active().deselect();
	$("#"+id).remove();

	document.getElementById("standardMenu").style.display="none";
	clearMenu();
}

var inserisciElemento=function(classe, spec){
	var div=document.createElement('div');
	//TRADUTTORE NON MODIFICARE
	var vdSize=l*0.10;
	if(classe==="video")
		div.style.width=vdSize+"px";
	//console.log(div.style.width);
	//TRADUTTORE

	div.style.position = "absolute";
	div.style.zIndex = zindex;
	zindex++;
	div.setAttribute("class", classe+" elemento");
	
	//TRADUTTORE EDIT
	if(spec){
		contatore = spec.id;
		div.style.rotation = spec.rotation;
		div.style.height = spec.height + "px";
		div.style.width = spec.width + "px";
		div.style.top = spec.top + "px";
		div.style.left = spec.left + "px";
		if(classe === "frame"){
			div.style.backgroundColor = spec.backgroundColor;
			div.style.backgroundImage = spec.backgroundImage;
		}
	}
	//TRADUTTORE EDIT

	div.id=contatore;
	var idx="x"+contatore;
	var idForward="for"+contatore;
	var idBack="back"+contatore;

	if(classe=="frame"){
		document.getElementById("frames").appendChild(div);
	}
	else{
		document.getElementById("elements").appendChild(div);
	}

	//TRADUTTORE EDIT
	if(spec)
		rotate(contatore, spec.rotation);
	//TRADUTTORE EDIT

	$(div).append("<img title=\"elimina\"class=\"deleteButton\" id=\""+idx+"\" syle=\"text-align:center\" src=\"assets/x.png\" onclick=\"angular.element(this).scope().rimuoviElemento()\" width=\"20em\">");//inserisce immagine x

	$(div).append("<img title=\"porta avanti\"class=\"bringForwardButton\" id=\""+idForward+"\" syle=\"opacity: 0; text-align:center\" src=\"assets/bringfront.png\" onclick=\"angular.element(this).scope().portaAvanti("+div.id+");\" width=\"15em\" >");//inserisce immagine bring to front

	$(div).append("<img title=\"manda dietro\"class=\"moveBackwardButton\" id=\""+idBack+"\" syle=\"text-align:center\" src=\"assets/movebackward.png\" onclick=\"angular.element(this).scope().portaDietro("+div.id+");\" width=\"15em\">");//inserisce immagine move backward
	
	contatore++;

	var xInit;
	var yInit;
	var heightInit;
	var widthInit;
	$(div).mousedown(function(){
		xInit=$(this).position().left;
		yInit=$(this).position().top;
	});

	active().select(div.id);

	return div;
}

var inserisciFrame=function(spec){
	var div=inserisciElemento("frame", spec);
	//div.setAttribute("ondblclick", "zoomIn()");
	$(function() {
		$( div ).resizable({
		    aspectRatio: 1 / 1,
		    stop: function(event, ui) {
		        angular.element(this).scope().ridimensionaElemento()
		    }
		});
	});
	return div;
}

//NEWTEXT
var inserisciTesto=function(spec){
	var div=inserisciElemento("text", spec);
	//TRADUTTORE
	div.style.width="50px";
	div.style.height="50px";
	//TRADUTTORE
	div.style.padding="1em";
	var txt = document.createElement('input');

	//TRADUTTORE EDIT
	if(spec){
		txt.fontFamily = spec.font;
		txt.style.color = spec.color;
		//txt.setAttribute("style","font-size: " + spec.size + "; width:1");
		txt.value = spec.content;
	}
	//TRADUTTORE EDIT
	else{
		//TRADUTTORE
		div.style.width="50px";
		div.style.height="50px";
		//TRADUTTORE
		txt.fontFamily="Arial, Helvetica, sans-serif";
		
	}
	txt.id="txt"+div.id;
	txt.setAttribute("style","font-size: 31px; width:1");
	txt.setAttribute("type","text");
	txt.setAttribute("class","autogrow");
	//txt.setAttribute("style","font-size: 100%; width:1");
	txt.size=1;
	txt.setAttribute("placeholder","Testo...");
	txt.style.border="0";

	div.appendChild(txt);
	$( "#txt"+div.id ).focus();
	$(function() {
	    $(div).resizable({
	        stop: function (event, ui) {
	            angular.element(this).scope().ridimensionaElemento()
	        }
		});
	});
	$(function(){
		$("input.autogrow").autoGrowInput({minWidth:10,comfortZone:1});
	});
	return div;
}
//NEWTEXT

var inserisciMedia=function(x,classe, spec){
	console.log(x);
	var div=inserisciElemento(classe);
	var url;
	if(spec)
		url = spec.ref;
	else
		url = x;
	var type;
	var z=scale;
	$(div).css({
	    "-ms-transform": "scale("+1/z+")", /* IE 9 */
	    "-webkit-transform":"scale("+1/z+")", /* Chrome, Safari, Opera */
	    "transform": "scale("+1/z+")",
	});
	if(classe==="image")
		type="img";
	else if(classe==="audio")
		type="audio";
	else if(classe==="video")
		type="video";
	var element=document.createElement(type);
	//TRADUTTORE
	var imgSize=l*0.10;
	if(type==="img")
		element.style.width=imgSize+"px";
	//console.log(element.style.width);
	//TRADUTTORE
	element.setAttribute("class", "resizable");
	element.id=type+div.id;
	element.src=url;
	div.appendChild(element);
	
	return div;

}

var inserisciImmagine=function(x, spec){
	console.log(spec);
	var div = inserisciMedia(x,"image", spec);    
	var img = document.getElementById('img'+div.id);
	var width = img.clientWidth;
	var height = img.clientHeight;
	$(function() {
		$(img).resizable({
		    aspectRatio: width / height,
		    stop: function(event, ui) {
		    angular.element(this).scope().ridimensionaElemento()
		}
		});
	});
	return div;
}

var inserisciVideo=function(x, spec){
	var div = inserisciMedia(x,"video", spec);
	var vid = document.getElementById('video'+div.id);
	//TRADUTTORE
	vid.style.padding="0";
	//TRADUTTORE
	vid.style.height="inherit";
	vid.style.width="inherit";
	var width = vid.clientWidth;
	var height = vid.clientHeight;
	$(function() {
		$(div).resizable({
		    aspectRatio: width / height,
		    stop: function (event, ui) {
		        angular.element(this).scope().ridimensionaElemento()
		    }
		});
	});
	return div;
}

var inserisciAudio=function(x, spec){
	var div = inserisciMedia(x,"audio", spec);

	var aud = document.getElementById('audio'+div.id);
	$(function() {
		$(div).resizable({
		    aspectRatio: 1 / 1,
		    stop: function (event, ui) {
		        angular.element(this).scope().ridimensionaElemento()
		    }
		});
	});
	$("#"+div.id).css({"background":"url('assets/nota.png') no-repeat", "background-size": "100% 100%"});;
	/*div.style.height="2em";
	div.style.width="2em";*/

	//TRADUTTORE
	var adSize=l*0.10;
	div.style.width=adSize+"px";
	div.style.height=adSize+"px";
	//console.log(div.style.width);
	//TRADUTTORE
	return div;
}


function resize(elem, percent) { elem.style.fontSize = percent; }

function getElementByZIndex(zvalue) {
    var el;
    var found = false;
    var frames = document.getElementById("frames").children;
    for (var i = 0; i < frames.length && !found; i++) {
        if (frames[i].style.getPropertyValue("z-index") == zvalue) {
            el = frames[i];
            found = true;
        }
    }

    var elements = document.getElementById("elements").children;
    for (var i = 0; i < elements.length && !found; i++) {
        if (elements[i].style.getPropertyValue("z-index") == zvalue) {
            el = elements[i];
            found = true;
        }
    }
    return el;
}

function portaAvanti(id) {
    var original = $("#" + id).zIndex();
    var superior = getElementByZIndex(original + 1);
    if (superior) {
        superior.style.zIndex = original;
        $("#" + id).css({ "z-index": original + 1 });
        if (original == 0) {
            document.getElementById("back" + id).style.opacity = '1';
            document.getElementById("back" + id).style.WebkitTransition = 'opacity 0.5s';
            document.getElementById("back" + id).style.MozTransition = 'opacity 0.5s';
        }
    }
    if ($("#" + id).zIndex() == zindex-1) {
        document.getElementById("for" + id).style.opacity = '0';
    }

}

function mandaDietro(id){
    if ($("#" + id).zIndex() > 0) {
  
        getElementByZIndex($("#" + id).zIndex() - 1).style.zIndex = $("#" + id).zIndex();
		$("#"+id).css({"z-index": $("#"+id).zIndex()-1});
		document.getElementById("for" + id).style.opacity = '1';
		document.getElementById("for" + id).style.WebkitTransition = 'opacity 0.5s';
		document.getElementById("for" + id).style.MozTransition = 'opacity 0.5s';
    }
	if($("#"+id).zIndex()==0){
		document.getElementById("back"+id).style.opacity = '0';
	}

}

function toggleElement(id) { 
	var element=document.getElementById(id);
	if(document.getElementById(id).style.display==="block"){
		element.style.display="none";
	}
	else{
		document.getElementById(id).style.display="block";

	}
}

function hideElement(el) { 
	el.setAttribute("style", "display:none");
}

$(document).mousedown(function(e) {
	var frames = document.getElementById("frames").children;
	var selected="undefined";

	for(var i = 0; i < frames.length; i++)
	{
		if( $(event.target).is("#"+frames[i].id))
		{
			active().select(frames[i].id);

			selected="frame";
			//SFONDO FRAME
			var att=frames[i].id;
			//var backgroundFrame=document.getElementById("backgroundFrame");
			//backgroundFrame.setAttribute("onchange","angular.element(this).scope().cambiaColoreSfondoFrame('"+att+"', this)");//"
			//var backgroundFrameEraser=document.getElementById("backgroundFrameEraser");
			//backgroundFrameEraser.setAttribute("onclick","document.getElementById('"+att+"').style.removeProperty ('background')");
			var addToMain=document.getElementById("addToMain");
			if(!mainPath().contains(frames[i].id)){
				//addToMain.removeAttribute("disabled");
				//addToMain.setAttribute("onclick","mainPath().addToMainPath("+frames[i].id+")");

			}
			else{
				//addToMain.setAttribute("disabled","disabled");
				
			}
			//SFONDO FRAME
		}
		else if($(event.target).is('#fantoccio') || $(event.target).is('#content')|| $(event.target).parents().is('#elements')){
			console.log("deselect");
			active().deselect();
		}
	}
	
	var elements = document.getElementById("elements").children;
	for(var i = 0; i < elements.length; i++) 
	{
		
		if( $(event.target).is("#"+elements[i].id) || $(event.target).parents().is("#"+elements[i].id))
		{
				active().deselect();
			if($(event.target).hasClass("image")||$(event.target).parents().hasClass("image"))
				selected="image";
			if($(event.target).hasClass("video")||$(event.target).parents().hasClass("video")||$(event.target).hasClass("audio")||$(event.target).parents().hasClass("audio"))
				selected="media";
			else if($(event.target).hasClass("SVG")||$(event.target).parents().hasClass("SVG"))
				selected="SVG";
			else if($(event.target).hasClass("text")||$(event.target).parents().hasClass("text"))
				selected="text";
			active().select(elements[i].id);

			//SFONDO FRAME
			document.getElementById("backgroundFrame").removeAttribute("onchange");
			//SFONDO FRAME
		}

		else if($(event.target).is('#fantoccio') || $(event.target).is('#content') || $(event.target).parents().is("#elements")){
			active().deselect();
		}
	}
	if(selected!="undefined"){
		document.getElementById("standardMenu").style.display="block";	
		document.getElementById(selected+"Menu").style.display="block";	

	}
	//SFONDO FRAME
	else{
		if(($(event.target).is('#content')))
			document.getElementById("backgroundFrame").removeAttribute("onchange");
	}
	//SFONDO FRAME

	//NEWTEXT
	if(selected==="text"){
		var colorText=document.getElementById("colorText");
		colorText.setAttribute("onchange","document.getElementById('txt"+active().getId()+"').style.color = '#'+this.color");
		//TESTO
		$('#textSize').on('change', function () {
			var v = $(this).val();
			$('#txt'+active().getId()).css('font-size', v + 'em');
			$(function(){
				$("input.autogrow").autoGrowInput({minWidth:10,comfortZone:1});
			});
		});
		//TESTO
	}
	//NEWTEXT
});


//NEWTEXT
function countChar(val) {
	var len = val.value.length;
	return len;
};
//NEWTEXT

function selezionaPercorso(id){
	if (mainPath().getPercorso().indexOf(id)>-1){

		for (var i=0; i<mainPath().getPercorso().length; i++){
			document.getElementById(mainPath().getPercorso()[i]).style.border= "0.25em solid red"
		}
	}
	for (var i=0; i<choicePaths().getPercorsi().length; i++){
		if (choicePaths().getPercorsi()[i].path.indexOf(id)>-1){
			for (var j=0; j<choicePaths().getPercorsi()[i].path.length; j++){
				document.getElementById(choicePaths().getPercorsi()[i].path[j]).style.border= "0.25em solid #"+choicePaths().getPercorsi()[i].selectionColor;
			}
		}
	}

};


function deselezionaPercorso(id){

	var main=mainPath();
	
	if (main.getPercorso().indexOf(id)==-1){
		for (var i=0; i<main.getPercorso().length; i++){
			document.getElementById(main.getPercorso()[i]).style.removeProperty('border');
		}
	}
	for (var i=0; i<choicePaths().getPercorsi().length; i++){
		if (choicePaths().getPercorsi()[i].path.indexOf(id)==-1){
			for (var j=0; j<choicePaths().getPercorsi()[i].path.length; j++){

				document.getElementById(choicePaths().getPercorsi()[i].path[j]).style.removeProperty('border');
			}
		}
	}
};




$(document).ready(function(){
	var main=mainPath();
	var paths=choicePaths();
	paths.createChoicePath();
});
document.onload= function(){
	
	alert("ok");
	var imageLoader = document.getElementById('imageLoader');
	imageLoader.addEventListener('change', handleImage, false);
	var canvas = document.getElementById('imageCanvas');
	var ctx = canvas.getContext('2d');


	function handleImage(e){
		var reader = new FileReader();
		reader.readAsDataURL(e.target.files[0]);
		reader.onload = function(event){
			var img = new Image();
			img.src = event.target.result;
			img.onload = function(){
				inserisciImmagine(event.target.result);
			}
			img.src = event.target.result;
		}   
	}
};

//SFOGLIA FILE
function readURL(input,type) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		reader.onload = function (e) {
			console.log("ciao1");
			if(type==="img")
				inserisciImmagine(e.target.result);
			else if(type==="vid"){
				console.log("ciao");
				inserisciVideo("Filmato.mp4");
			}
			else 
				if(type==="aud")
					inserisciAudio("Kalimba.mp3");
			}

			reader.readAsDataURL(input.files[0]);
		}
	}

	$("#imgLoader").change(function(){
		readURL(this,"img");
	});
	$("#videoLoader").change(function(){
		readURL(this,"vid");
	});
	$("#audioLoader").change(function(){
		readURL(this,"aud");
	});
//SFOGLIA FILE

//IMMAGINE SFONDO
function backgroundReadURL(input, id) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		reader.onload = function (e) {
			if(id==="fantoccio"){
				$("#fantoccio").css({"background":"url('"+e.target.result+"')"});
			}
			else{
				$("#"+id).css({"background":"url('"+e.target.result+"') no-repeat", "background-size": "100% 100%"});
			}


		}
		reader.readAsDataURL(input.files[0]);
	}
}
/*
$("#contentBackgroundLoader").change(function(){
	backgroundReadURL(this, "fantoccio");
});
// IMMAGINE SFONDO

//IMMAGINE SFONDO
$("#frameBackgroundLoader").change(function(){
	backgroundReadURL(this, active().getId());
});
//IMMAGINE SFONDO
*/
//NEWTEXT
(function($){

	$.fn.autoGrowInput = function(o) {

		o = $.extend({
			maxWidth: 1000,
			minWidth: 0,
			comfortZone: 70
		}, o);

		this.filter('input:text').each(function(){

			var minWidth = o.minWidth || $(this).width(),
			val = '',
			input = $(this),
			testSubject = $('<tester/>').css({
				position: 'absolute',
				top: -9999,
				left: -9999,
				width: 'auto',
				fontSize: input.css('fontSize'),
				fontFamily: input.css('fontFamily'),
				fontWeight: input.css('fontWeight'),
				letterSpacing: input.css('letterSpacing'),
				whiteSpace: 'nowrap'
			}),
			check = function() {

				if (val === (val = input.val())) {return;}

                    // Enter new content into testSubject
                    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,'&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    testSubject.html(escaped);

                    // Calculate new width + whether to change
                    var testerWidth = testSubject.width(),
                    newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                    currentWidth = input.width(),
                    isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                    || (newWidth > minWidth && newWidth < o.maxWidth);

                    // Animate width
                    if (isValidWidthChange) {
                    	input.width(newWidth);
                    }

                };
                testSubject.insertAfter(input);

                $(this).bind('keyup keydown blur update', check);

            });

return this;

};

})(jQuery);

function mediaControl(){
	var element;
	if(document.getElementById("video"+active().getId()))
		element=document.getElementById("video"+active().getId());
	else
		element=document.getElementById("audio"+active().getId());
	if(element.paused==true)
		element.play();
	else
		element.pause();
};
var scale=100;
function zoomIn() {
    $("#content").css({ "overflow": "scroll", "height": "auto" });
    var degrees = 0 - getRotationDegrees($("#" + active().getId()));
    var rotRad = degrees * Math.PI / 180;
    scale = ($("#content").height() / $("#" + active().getId()).height()) * 75;
    var z = scale;
    console.log(degrees);
    var nleft = (document.getElementById(active().getId()).style.left);
    console.log("new left " + nleft);
    var ntop = (document.getElementById(active().getId()).style.top);
    var elements = document.getElementById("frames").children;
    console.log("radianti " + rotRad);
    var yCenter = document.getElementById("fantoccio").offsetHeight / 2;
    var xCenter = document.getElementById("fantoccio").offsetWidth / 2;
    var width = document.getElementById(active().getId()).offsetWidth;
    var height = document.getElementById(active().getId()).offsetHeight;
    var devX = ((0 - width / 2 - 6) * Math.cos(-rotRad) + (height / 2 + 6) * Math.sin(-rotRad) + width / 2 + 6);
    var devY = ((width / 2 + 6) * Math.sin(-rotRad) + (height / 2 + 6) * Math.cos(-rotRad) - height / 2 - 6);
    var val = (0 - parseFloat(nleft) + (1 / 2) * document.getElementById(active().getId()).offsetWidth) + " " + (0 - parseFloat(ntop) + (1 / 2) * document.getElementById(active().getId()).offsetHeight);
    $("#fantoccio").append('<div height="2em" width="2em" style="top: ' + (parseFloat(ntop) - devY) + 'px; left: ' + (parseFloat(nleft) + devX) + 'px; background-color: red"/>');
    $("#fantoccio").css({
        //"position": "absolute",
        /*"left": (0 - ((parseFloat(nleft) + devX - xCenter) * Math.cos(0 - rotRad) + (parseFloat(ntop) - devY - yCenter) * Math.sin(0 - rotRad) + xCenter)) + "px",
        "top": (0 - (0 - (parseFloat(nleft) + devX - xCenter) * Math.sin(0 - rotRad) + (parseFloat(ntop) - devY - yCenter) * Math.cos(0 - rotRad) + yCenter)) + "px",*/
        "-ms-transform": "rotate(" + degrees + "deg)", /* IE 9 */
        "-webkit-transform": "rotate(" + degrees + "deg)", /* Chrome, Safari, Opera */
        "transform": "rotate(" + degrees + "deg)",
        "-webkit-transition": "all 0.5s ease-in-out",
        "-moz-transition": "all 0.5s ease-in-out",
        "-o-transition": "all 0.5s ease-in-out",
        "transition": "all 0.5s ease-in-out"
    });
    $("#content").css({ "zoom": z + "%" });
    document.getElementById(active().getId()).scrollIntoView();
};

function zoomOut() {
    if (!active().getId()) {
        scale = 100;
        var z = scale;
        var degrees = 0;
        var frames = $("#frames").children();
        $("#content").css({ "overflow": "hidden" });
        var elements = document.getElementById("frames").children;

        $("#fantoccio").css({
            "zoom": z + "%",
            "position": "relative",
            "left": 0,
            "top": 0,
            "-ms-transform": "rotate(" + degrees + "deg) ", /* IE 9 */
            "-webkit-transform": "rotate(" + degrees + "deg)", /* Chrome, Safari, Opera */
            "transform": "rotate(" + degrees + "deg) ",


        });
        $("#content").css({ "zoom": z + "%" });
    }

};


var click = {
    x: 0,
    y: 0
};
function updateDraggable(){
	var div=$("#"+active().getId());
	var originalHeight = $(div).height();
    var originalWidth = $(div).width();
	var originalLeft=$(div).css("left");
	var originalTop=$(div).css("top");
	console.log("original left: " + originalLeft);
	$(div).draggable(
	{
		start: function(event, ui) {
        click.x = event.clientX;
        click.y = event.clientY;
        
        
    },
	containment: "fantoccio",
    drag: function(event, ui){
    var original = ui.originalPosition;
        // jQuery will simply use the same object we alter here
        ui.position = {
            left: (event.clientX - click.x + original.left)/(scale/100),
            top:  (event.clientY - click.y + original.top) /(scale/100)
        };
    },
    stop: function (event, ui) {
        angular.element(this).scope().muoviElemento()
	}
});

$(".droppable").droppable({
	
		drop: function(event, ui) {
			
			if($(ui.draggable).hasClass("frame") && $(ui.droppable).id!="content"){
				$(ui.draggable).css({top: originalTop, left: originalLeft, position:'absolute', width: originalWidth, height:originalWidth});
			}
		},
		over: function(event, ui) {
			if($(ui.draggable).hasClass("frame") && $(ui.droppable).id!="content"){
			if($(ui.draggable).hasClass("frame")){
				$(ui.draggable).animate({
					width: '3em',
					height: '3em'
				}, 300);
			}
		}
			},

            /*$(this).mousemove(function(e) {
            	console.log("ciao");
        $(div).show(2000);
         $(div).css({position:"absolute", left:e.pageX,top:e.pageY});

     });*/




out: function(event, ui) {
	if($(ui.draggable).hasClass("frame")){
		$(ui.draggable).animate({
			width: originalWidth,
			height: originalHeight
		}, 300);
	}
}

});
}

$(document).ready(function () {
    $("#fantoccio").height($("#content").height()*0.9);
    console.log("altezza content", document.getElementById("content").style.height)

});


function flash(id) {
    $("#" + id).animate({
        "-ms-transform": "scale(1.1)",
    "-webkit-transform": "scale(1.1)"
    }, 400);
    
}


$(function () {
    var origin;
    $("#sortable").sortable({
        start: function (event, ui) {
            origin = ui.item.index();
            console.log("origine " + origin);
        },
        
        stop: function (event, ui) {
            var temp = new Array();
            var ids = new Array();
            $("#sortable md-list-item").each(function (index, item) {
                ids.push(mainPath().getAssociation($(item).attr("id")));
                
            });
            mainPath().setPath(ids);
            
            
        }
    });
    $("#sortable").disableSelection();
        

});
/*
angular.module('menuDemoWidth', ['ngMaterial'])
.config(function ($mdIconProvider) {
    $mdIconProvider
      .iconSet("call", 'img/icons/sets/communication-icons.svg', 24)
      .iconSet("social", 'img/icons/sets/social-icons.svg', 24);
})
.controller('WidthDemoCtrl', premiEditController);
*/

