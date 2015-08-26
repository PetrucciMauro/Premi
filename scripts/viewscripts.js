/*
 Name :
        Manuel Fossa
        Matteo Busetto
	    Giovanni Venturelli
 Package : View
 Location : /scripts/
 Description
	Definizione delle funzioni che si occupano di gestire le modifiche visuali della pagina edit.html.

*/


//TRADUTTORE NO MODIFICARE
var l=screen.width;
l=l*0.989;
var h=l/2.06666667;
var styleContent = document.getElementById("content").style;
styleContent.width = l+"px";
styleContent.height = h + "px";

//TRADUTTORE
var zindex = 0;
var contatore = 1;
var originalTopMenu;
$(document).ready(function () {
	var origin;
	$("#sortable").sortable({
		start: function(event,ui){
			origin=ui.item.index();
		},
		change: function (event, ui) {
			$(ui.item[0].previousElementSibling).trigger("click");
			$(ui.item[0].nextElementSibling).trigger("click");

			},
			stop: function (event, ui) {
				mainPath().removeFromMainPath(mainPath().getAssociation($(ui.item[0]).attr("id")), origin);
				mainPath().addToMainPath(mainPath().getAssociation($(ui.item[0]).attr("id")), ui.item.index());

			}
		});
	$("#sortable").disableSelection();
	document.getElementById("premiFooter").style.marginTop = styleContent.height;
	document.getElementById("premiFooter").style.position = "relative";

	originalTopMenu = $("#contextual-menu").css("margin-top").replace("px", "");
	$("#content").css("margin-top", $("#contextual-menu").height());

	/*html2canvas($("#content"), {
	    onrendered: function (canvas) {
	        // canvas is the final rendered <canvas> element
	        var myImage = canvas.toDataURL("image/png");
	        var element =  document.createElement('div');
	        element.id = "miniature";
	        element.appendChild = canvas;
	        document.body.appendChild(element);
	        
	    },
	    width: 300,
	    height: 300
	});*/
});

$(document).keyup(function(e){
    if (e.keyCode == 46) {
        if (active().getId()) {
            $("#deleteElement").click();
        }
    }
});
var repeating = false;
var repeatRateTimer = null;
var repeating = false;
var repeatRateTimer = null;


$(document).bind('keydown', function (input) {
    if (active().getId() && (input==37 || input==38 || input == 39 || input ==40)) {
        input.preventDefault();
    }
    if (repeating == true) {
        if (repeatRateTimer != null) {
            clearTimeout(repeatRateTimer);
            repeatRateTimer = null;
        }
        else {
            repeatRateTimer = setTimeout(function () { repeating = false; }, 0.0000000001);
        }
        keyMove(input);
        return;
    }
    repeating = true;
});

function keyMove(input){
switch (input.which) {
    case 37:

        if (active().getId()) {
            $("#" + active().getId()).stop().animate({
                left: '-=1'
            }); //left arrow key
            input.preventDefault();
        }
        break;
    case 38:

        if (active().getId()) {
            $("#" + active().getId()).stop().animate({
                top: '-=1'
            }); //up arrow key
            input.preventDefault();
        }
        break;
    case 39:

        if (active().getId()) {
            $("#" + active().getId()).stop().animate({
                left: '+=1'
            }); //right arrow key
            input.preventDefault();
        }
        break;
    case 40:

        if (active().getId()) {
            $("#" + active().getId()).stop().animate({
                top: '+=1'
            }); //bottom arrow key
            input.preventDefault();
        }
        break;
}
}




$(document).keyup(function (e) {
    switch (e.which) {
        case 37:
                angular.element($("#" + active().getId())).scope().muoviElemento();
             
            break;
        case 38:
            angular.element($("#" + active().getId())).scope().muoviElemento(); //up arrow key
            break;
        case 39:
            angular.element($("#" + active().getId())).scope().muoviElemento(); //right arrow key
            break;
        case 40:
            angular.element($("#" + active().getId())).scope().muoviElemento(); //bottom arrow key
            break;
    }
})

$(window).scroll(function (event) {
    $("#premiHeader").attr("style", "margin-top: " + $(document).scrollTop() + "px !important; margin-left: " + $(document).scrollLeft() + "px !important; -webkit-transition: margin-top 0.2s; transition: margin-top 0.2s;");
    var newTop = parseFloat(originalTopMenu) + parseFloat($(document).scrollTop());
    var menuStyle = $("#contextual-menu").attr("style") + " margin-top:" + (newTop) + "px; ; -webkit-transition: margin-top 0.2s; transition: margin-top 0.2s;";
    $("#contextual-menu").attr("style", menuStyle);
    console.log("premi header top " + $("#premiHeader").css("margin-top"));
    $("#contextual-menu").css("margin-left", ($(document).scrollLeft()) + "px");
    
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
			

			private.id = id;
			deselezionaPercorso(id);
			selezionaPercorso(id);
			if($(private.element).hasClass("frame")){
				angular.element(content).scope().AddBookmark();
				angular.element(content).scope().RemoveBookmark();
			}
			updateDraggable();
			
			
		};
		that.getId=function(){
			return private.id;
		};
		that.deselect=function(){
			clearMenu();
			if(document.getElementById(private.id)){
				document.getElementById(private.id).style.boxShadow= "none";
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
		var private = {};
		private.sindenav = 0; // viene impostato a 1 quando si esegue un'operazione durante la visualizzazione della barra laterale
		private.percorso=new Array();
		private.associations=new Array();
		that.getSidenav = function () {
		    return private.sidenav;
		}
		that.clearSidenav = function () {
		    private.sidenav = 0;
		}
		that.getPercorso = function () {
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
				var element = document.getElementById(id);
			   // element.innerHTML = "<div class='chipcontainer'><div class='chip' id='chip"+id+"'>"+(pos+1)+"</div></div>"+element.innerHTML ;
			   if (document.getElementById("addToMain"))
			   	document.getElementById("addToMain").removeAttribute("onclick");
			   selezionaPercorso(id);
		    }
            
		};
		that.upSidenav = function () {
		    console.log("up sidenav");
		    private.sidenav = 1;
		    console.log(that.getSidenav());
		}
		
		that.setMainPath = function (spec) {
		    private.percorso = spec.path;
		}

		that.removeFromMainPath=function(id){
			var index = new Array();
			var position;
			var found = false;
			if ($("#sort" + id).length) {
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
			deselezionaPercorso(popped.id);
			if (document.getElementById("addToMain"))
				document.getElementById("addToMain").setAttribute("onclick", "mainPath().addToMainPath(" + popped.id + ")");;
			document.getElementById(id).style.removeProperty('border');
			return popped;
		};

		that.setPath = function (newPath) {
		    private.percorso.length = 0;

			private.percorso = newPath;
		}

		that.deleteFrame=function(id){
			if ($("#sort" + id).length) {
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
	    if (frames[i].id != id && frames[i].style.getPropertyValue("z-index") > $("#" + id).zIndex()) {
			frames[i].style.zIndex = frames[i].style.zIndex - 1;
		}
	}

	var elements = document.getElementById("elements").children;
	for (var i = 0; i < elements.length; i++) {
	    if (elements[i].id != id && elements[i].style.getPropertyValue("z-index") > $("#" + id).zIndex()) {
	        
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


var resizeDiv = function(that, tipo){
	var div = $("#" + tipo + that.id);
	div.css("height",that.style.height);
	div.css("width",that.style.width);
}

var inserisciElemento = function (classe, spec) {
	var div=document.createElement('div');

	//TRADUTTORE NON MODIFICARE
	var vdSize=l*0.10;
	if(classe==="video")
		div.style.width=vdSize+"px";
	//TRADUTTORE

	div.style.position = "absolute";
	div.style.zIndex = zindex;
	div.setAttribute("class", classe+" elemento");
	var id = contatore;

	console.log(spec);
	//TRADUTTORE EDIT
	if(spec && spec.id){
		if(contatore < spec.id)//in contatore si salva l'id maggiore
			contatore = spec.id;
		id = spec.id;
	}

	if(spec && spec.height && spec.width){
		div.style.height = spec.height + "px";
		div.style.width = spec.width + "px";
	}
	else{
		div.style.height = 230 + "px";
		div.style.width = 230 + "px";
	}

	if (spec && spec.yIndex && spec.xIndex) {
		div.style.top = spec.yIndex + "px";
		div.style.left = spec.xIndex + "px";
	}
	else{
		div.style.top = 0 + "px";
		div.style.left = 0 + "px";
	}

	div.id=id;
	//TRADUTTORE EDIT

	if(classe=="frame"){
		div.style.backgroundColor = spec.color || undefined;
		div.style.backgroundImage = spec.image || undefined;
		document.getElementById("frames").appendChild(div);
	}
	else {
		document.getElementById("elements").appendChild(div);
	}

	//TRADUTTORE EDIT

	//TRADUTTORE EDIT

	contatore++;
	zindex++;

	var xInit;
	var yInit;
	var heightInit;
	var widthInit;
	$(div).mousedown(function(){
		xInit=$(this).position().left;
		yInit=$(this).position().top;
	});
	if(!spec)
		active().select(div.id);

	return div;
}

var inserisciFrame = function (spec) {
	var div=inserisciElemento("frame", spec);
	$(function() {
		$( div ).resizable({
			aspectRatio: 1 / 1,
			start: function(){
				if(active().getId() != div.id){
					active().deselect();
					active().select(div.id);
				}
			},
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
	
	div.style.padding="1em";
	var txt = document.createElement('textarea');

	//TRADUTTORE EDIT
	if(spec.id){
		txt.style.color = spec.color;
		txt.style.fontFamily = spec.font;
		txt.style.fontSize = spec.fontSize + "em";
		txt.value = spec.content;
		txt.style.height = spec.height + "px";
		txt.style.width = spec.width + "px";
		div.style.width= spec.width + "px";
		div.style.height=spec.height + "px";
	}
	//TRADUTTORE EDIT
	else{
		//TRADUTTORE
		div.style.width="50px";
		div.style.height="50px";
		txt.style.width = "50px";
		txt.style.height = "50px";
		//TRADUTTORE
		txt.style.fontFamily="Arial, Helvetica, sans-serif";
		txt.style.fontSize = "1em";

	}
	txt.id="txt"+div.id;
	txt.setAttribute("class", "autogrow");
	txt.setAttribute("onblur", "aggiornaTesto(" + div.id + ", this)");
	txt.size=1;
	txt.setAttribute("placeholder","Testo...");
	txt.style.outline="none";
	txt.style.border="none";
	txt.style.resize="none";
	txt.style.backgroundColor = "transparent";

	div.setAttribute("onresize","resizeDiv(this, \"txt\")");

	div.appendChild(txt);
	resizeDiv(div, "txt");

	$( "#txt"+div.id ).focus();
	$(function() {
		$(div).resizable({
			aspectRatio: 1 / 1,
			start: function(){
				if(active().getId() != div.id){
					active().deselect();
					active().select(div.id);
				}
			},
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

var inserisciMedia = function (x, classe, spec) {
	var div = inserisciElemento(classe, spec);

	var url = {};
	if(spec && spec.ref)
		url = spec.ref;
	else
		url = x;

	var type;
	if(classe==="image")
		type="img";
	else if(classe==="audio")
		type="audio";
	else if(classe==="video")
		type="video";

	var element = document.createElement(type);
	console.log(div.style.height);
	if(!spec){
    element.onload = function () {
	    var H = this.height,
                
            W = this.width;
	}
}
    console.log(div.style.height);
	//TRADUTTORE
	if(!spec){
		var imgSize=l*0.10;
		if (type === "img") {
		    element.style.width = imgSize + "px";
		    element.style.height = "auto";
		}
	}
	//TRADUTTORE
	element.setAttribute("class", "resizable");
	element.id=type+div.id;
	element.src = url;
	div.style.padding = 0;
	div.appendChild(element);
	console.log(div.style.height);
	return div;
}

var inserisciImmagine=function(x, spec){
    var div = inserisciMedia(x, "image", spec);

    var img = document.getElementById('img' + div.id);
    if (spec.id && spec.height && spec.width) {
        div.style.height = spec.height + "px";
        div.style.width = spec.width + "px";
        img.style.height = spec.height + "px";
        img.style.width = spec.width + "px";
    }
    var width = $(img).outerWidth();
	var height = $(img).outerHeight();

    img.style.height = height + "px";
    img.style.width = width + "px";
    img.style.padding=0;
	div.style.height = height + "px";
	div.style.width = width + "px";
	div.style.padding="0.2em";

	div.setAttribute("onresize","resizeDiv(this, \"img\")");
	resizeDiv(div, "img");

	$(function() {
		$(div).resizable({
			aspectRatio: width / height,
			start: function(){
				if(active().getId() != div.id){
					active().deselect();
					active().select("image"+div.id);
				}
			},
			stop: function(event, ui) {
				angular.element(this).scope().ridimensionaElemento()
			}
		});
	});
	return div;
}

var inserisciVideo=function(x, spec){
	var div = inserisciMedia(x,"video", spec);

	if(spec){
		div.style.height = spec.height + "px";
		div.style.width = spec.width + "px"; 
	}
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
			start: function(){
				if(active().getId() != div.id){
					active().deselect();
					active().select("video"+div.id);
				}
			},
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
			start: function(){
				if(active().getId() != div.id){
					active().deselect();
					active().select("audio"+div.id);
				}
			},
			stop: function (event, ui) {
				angular.element(this).scope().ridimensionaElemento(undefined, spec.id)
			}
		});
	});
	$("#"+div.id).css({"background":"url('assets/nota.png') no-repeat", "background-size": "100% 100%"});;

	//TRADUTTORE
	if(!spec){
		var adSize=l*0.10;
		div.style.width=adSize+"px";
		div.style.height=adSize+"px";
	}
	//TRADUTTORE
	return div;
}

function aggiornaTesto(id, element) {
	angular.element(document.getElementById("content")).scope().aggiornaTesto(id, element.value);
}

function resize(elem, percent){
	elem.style.fontSize = percent;
}

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

	var ris = -1;
	if (superior) {
		superior.style.zIndex = original;
		$("#" + id).css({ "z-index": original + 1 });
		ris = superior;
	}

	return ris;
}

function mandaDietro(id){
	var ris = -1;
    if ($("#" + id).zIndex() > 0) {
        var original = $("#" + id).zIndex();
		var element = getElementByZIndex(original - 1);
		if (element)
		    ris = portaAvanti(element.id);
	}
	return ris;
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
	if(document.getElementById("content") == undefined)
		return;
	var frames = document.getElementById("frames").children;
	var selected="undefined";

	for(var i = 0; i < frames.length; i++){
		if( $(event.target).is("#"+frames[i].id)){
			active().select(frames[i].id);

			selected="frame";
			//SFONDO FRAME
			var att=frames[i].id;
			var addToMain=document.getElementById("addToMain");
			//SFONDO FRAME
		}
		else if( $(event.target).is('#content')|| $(event.target).parents().is('#elements')){
			active().deselect();
		}
	}
	
	var elements = document.getElementById("elements").children;
	for(var i = 0; i < elements.length; i++) {
		
		if($(event.target).is("#"+elements[i].id) || $(event.target).parents().is("#"+elements[i].id)){
			active().deselect();
			if($(event.target).hasClass("image")||$(event.target).parents().hasClass("image"))
				selected="image";
			else if($(event.target).hasClass("video")||$(event.target).parents().hasClass("video")||$(event.target).hasClass("audio")||$(event.target).parents().hasClass("audio"))
				selected="media";
			else if($(event.target).hasClass("SVG")||$(event.target).parents().hasClass("SVG"))
				selected="SVG";
			else if($(event.target).hasClass("text")||$(event.target).parents().hasClass("text"))
				selected="text";

			active().select(elements[i].id);

			//SFONDO FRAME

			//SFONDO FRAME
		} else if( $(event.target).is('#content') /*|| $(event.target).parents().is("#elements")*/){
			active().deselect();
		}
	}
	if(selected!="undefined"){
		document.getElementById("standardMenu").style.display="block";	
		document.getElementById(selected+"Menu").style.display="block";	
	}


});


//NEWTEXT
function countChar(val) {
	var len = val.value.length;
	return len;
};
//NEWTEXT

function selezionaPercorso(id){
	if (mainPath().getPercorso().indexOf(id)>-1){

		for (var i = 0; i < mainPath().getPercorso().length; i++) {
			if (document.getElementById(mainPath().getPercorso()[i]))
				document.getElementById(mainPath().getPercorso()[i]).style.border= "0.25em solid red"
		}
	}
	for (var i=0; i<choicePaths().getPercorsi().length; i++){
		if (choicePaths().getPercorsi()[i].path.indexOf(id)>-1){
			for (var j = 0; j < choicePaths().getPercorsi()[i].path.length; j++) {
				if (document.getElementById(mainPath().getPercorso()[i]).path[j])
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




var click = {
	x: 0,
	y: 0
};


//FUNZ. CHE DICE SE testDiv È DENTRO A div
function isInside(div, testDiv){
	var top1 = div.position().top;
	var top2 = testDiv.position().top;

	var left1 = div.position().left;
	var left2 = testDiv.position().left;

	var height1 = div.height();
	var height2 = testDiv.height();

	var width1 = div.width();
	var width2 = testDiv.width();

	var ris = false;
	if(top2 >= top1 && left2 >= left1)
		if((top2 + height2) <= (top1 + height1))
			if((left2 + width2) <= (left1 + width1))
				ris = true;

			return ris;
	}

function updateDraggable(element){
	var div=$("#"+active().getId());
	var tipo = active().getTipo();
	var others = [];

	var originalHeight = $(div).height();
	var originalWidth = $(div).width();
	var originalLeft=$(div).css("left");
	var originalTop=$(div).css("top");


	var elements = $("#elements").children();
	for(var i=0; i<elements.length && elements[i].id != div.id && tipo == "frame"; ++i){
		var x = $("#" + elements[i].id);
		if (isInside(div, x)) {
		    var spec = {
		        id: elements[i].id,
		        originalLeft: x.position().left,
		        originalTop: x.position().top
		    }
		    others.push(spec);
		}
		}

		$(div).draggable({
			start: function(event, ui) {
				click.x = event.clientX;
				click.y = event.clientY;
			},
			containment: "#content",
			drag: function(event, ui){
				var original = ui.originalPosition;

				var left = event.clientX - click.x + original.left;
				var top = event.clientY - click.y + original.top;

				if(left>0 && top>0 && (left+originalWidth)<l && (top+originalHeight)<h){
					ui.position = {
						left: left,
						top:  top
					};
				}

				if(!others[0])
					others.length = 0;
				//muovi gli elementi dentro il frame
				for(var i=0; i<others.length; ++i){
					var leftEle = event.clientX - click.x + others[i].originalLeft;
					var topEle = event.clientY - click.y + others[i].originalTop;
					
					var topOk = leftOk = true;

					if(left < 0 || (left + originalWidth)>l)
						leftOk = false;
					if(top < 0 || (top+originalHeight)>h)
						topOk = false;
					
					var x = $("#" + others[i].id);
					if(leftOk)	
						x.css("left", (leftEle));
					if(topOk)
						x.css("top", (topEle));
				}
			},
			stop: function (event, ui){
				angular.element(this).scope().muoviElemento();
				if(!others[0])
					others.length = 0;

				for(var i=0; i<others.length; ++i){
					var spec = {
						id: others[i].id,
						toUpdate: true
					}
					angular.element(this).scope().muoviElemento(spec);
				}
				others = [];
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
		},
		stop: function (event, ui) {
			var temp = new Array();
			var ids = new Array();
			$("#sortable md-list-item").each(function (index, item) {
				id = mainPath().getAssociation($(item).attr("id"));
				ids.push(id);

			});
			mainPath().setPath(ids);
			mainPath().upSidenav();
		}
	});
	$("#sortable").disableSelection();

	$(".dragElement").draggable({
	    cursor: "move",
	    cursorAt: { top: -12, left: 0 },
	});

	$("#dragFrame").draggable({
	    helper: function (event, ui) {
	        return $("<div id='positioning' class='frame'></div>");
	    },
	    stop: function (event, ui) {
	        var e = window.event;
	        var spec = {
	            yIndex: e.clientY - $("#content").offset().top,
	            xIndex: e.clientX - $("#content").offset().left,
	            zIndex: zindex
	        }
	        var top = $("#content").offset().top;
	        var left = $("#content").offset().left;

	        if (((spec.yIndex + top) > top) && (spec.yIndex < (top + $("#content").height())) && ((spec.xIndex + left) > left) && (spec.xIndex < (left + $("#content").width())))
	            angular.element(content).scope().inserisciFrame(spec);
	    }
	});

	$("#dragText").draggable({
	    helper: function (event, ui) {
	        return $("<div id='positioning' class='text' style='border: thin solid black' ></div>");
	    },
	    stop: function (event, ui) {
	        var e = window.event;
	        var spec = {
	            yIndex: e.clientY - $("#content").offset().top,
	            xIndex: e.clientX - $("#content").offset().left
	        }
	        var top = $("#content").offset().top;
	        var left = $("#content").offset().left;

	        if (((spec.yIndex + top) > top) && (spec.yIndex < (top + $("#content").height())) && ((spec.xIndex + left) > left) && (spec.xIndex < (left + $("#content").width())))
	            angular.element(content).scope().inserisciTesto(spec);
	    }
	});
});

