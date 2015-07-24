
var contatore=0;
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

			document.getElementById("for"+id).style.opacity = '1';
			document.getElementById("for"+id).style.WebkitTransition = 'opacity 0.5s';
			document.getElementById("for"+id).style.MozTransition = 'opacity 0.5s';
			
			if($("#"+id).zIndex()>0){
				document.getElementById("back"+id).style.opacity = '1';
				document.getElementById("back"+id).style.WebkitTransition = 'opacity 0.5s';
				document.getElementById("back"+id).style.MozTransition = 'opacity 0.5s';
			}
			
			document.getElementById("rotation").innerHTML="<input id=\"rangeRotation\" type=\"range\" min=\"0\" max=\"360\" step=\"1\" value=\""+getRotationDegrees($("#"+id))+"\" oninput=\"rotate('"+id+"',this.value)\">";
			private.id=id;
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
		that.addToMainPath=function(id, position){
			var pos=position || private.percorso.length;
			private.percorso.splice(pos, 0, id);
			var s="";
			for (var i=0; i<private.percorso.length; i++){
				s=s+" "+private.percorso[i];
			}
			document.getElementById("mainp").innerHTML=s;
			document.getElementById("addToMain").removeAttribute("onclick");
			selezionaPercorso(id);
		};
        
        

		that.removeFromMainPath=function(id){
		    var position;
		    var found = false;
			for(var i = 0; i<private.percorso.length && !found; i++){
				if (private.percorso[i]==id){
				    position=i;
				    found = true;
				}
			}
			
			var popped;
			
				popped=private.percorso.splice(position, 1);
			
			return popped;
		};

		that.deleteFrame=function(id){

			for(var i = 0; i<private.percorso.length; i++){
				if (private.percorso[i]==id){
					private.percorso.splice(i, 1);
					i--;
				}
			}
		};

		that.contains = function (id) {
		    var contiene = false;
		    if (private.percorso.indexOf(parseInt(id)) > -1) {

		        contiene = true;
		    }
		    return contiene;
		};

		that.stampaPercorso = function () {
		    var element = $("#sortable");
		    element.empty();
		    for (var i = 0; i < private.percorso.length; i++) {
		        console.log("siamo entrati " + i);
		        element.append('<li class="ui-state-default" id="sort' + private.percorso[i] + '" onMouseOver="highlight(' + private.percorso[i].toString() + ')"  onMouseOut="highlight(' + private.percorso[i].toString() + ')" onClick="flash(' + private.percorso[i] + ')"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item ' + private.percorso[i] + '</li>');
		    	var obj = {};
		        obj.id = "sort" + private.percorso[i];
		        obj.association = private.percorso[i];
		        private.associations.push(obj);
		    }
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

		that.removeFromChoicePaths=function (id, position){
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

function elimina(id){
	if($("#"+id).hasClass("frame")){

		mainPath().deleteFrame(id);
		choicePaths().deleteFrame(id);

	}
	$("#"+id).remove();

	document.getElementById("standardMenu").style.display="none";
	clearMenu();
}

var inserisciElemento=function(classe){
	var div=document.createElement('div');
	div.id=contatore;
	div.style.position="absolute";
	div.setAttribute("class", classe+" elemento");
	var idx="x"+contatore;
	var idForward="for"+contatore;
	var idBack="back"+contatore;
	if(classe=="frame"){
		document.getElementById("frames").appendChild(div);
	}
	else
		document.getElementById("elements").appendChild(div);

	$(div).append("<img title=\"elimina\"class=\"deleteButton\" id=\""+idx+"\" syle=\"text-align:center\" src=\"src/img/x.png\" onclick=\"elimina("+div.id+");\" width=\"20em\">");//inserisce immagine x

	$(div).append("<img title=\"porta avanti\"class=\"bringForwardButton\" id=\""+idForward+"\" syle=\"text-align:center\" src=\"src/img/bringfront.png\" onclick=\"portaAvanti("+div.id+");\" width=\"15em\" style=\"display: block\">");//inserisce immagine bring to front


	
	$(div).append("<img title=\"manda dietro\"class=\"moveBackwardButton\" id=\""+idBack+"\" syle=\"text-align:center\" src=\"src/img/movebackward.png\" onclick=\"mandaDietro("+div.id+");\" width=\"15em\">");//inserisce immagine move backward
	
	contatore++;
	var xInit;
	var yInit;
	var heightInit;
	var widthInit;
	$(div).mousedown(function(){
		xInit=$(this).position().left;
		yInit=$(this).position().top;
	});
	

	return div;
}

var inserisciFrame=function(){
	var div=inserisciElemento("frame");
	div.setAttribute("ng-dblclick", "zoomIn()");
	$(function() {
		$( div ).resizable({
			aspectRatio: 1 / 1
		});
	});
	return div;
}

//NEWTEXT
var inserisciTesto=function(){
	var div=inserisciElemento("text");
	div.style.padding="1em";
	var txt = document.createElement('input');
	txt.setAttribute("type","text");
	txt.setAttribute("class","autogrow");
	txt.setAttribute("style","font-size: 100%; width:1");
	txt.size=1;
	txt.setAttribute("placeholder","Testo...");
	txt.style.border="0";
	txt.id="txt"+div.id;
	div.appendChild(txt);
	$( "#txt"+div.id ).focus();
	$(function() {
		$( div ).resizable({
		});
	});
	$(function(){
		$("input.autogrow").autoGrowInput({minWidth:10,comfortZone:1});
	});
	return div;
}
//NEWTEXT

var inserisciMedia=function(x,classe){
	var div=inserisciElemento(classe);
	var url=x;
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
	element.setAttribute("class", "resizable");
	element.id=type+div.id;
	element.src=url;
	div.appendChild(element);
	
	return div;

}

var inserisciImmagine=function(x){
	var div = inserisciMedia(x,"image");    
	var img = document.getElementById('img'+div.id);
	var width = img.clientWidth;
	var height = img.clientHeight;
	$(function() {
		$(img).resizable({
			aspectRatio: width / height
		});
	});
	return div;
}

var inserisciVideo=function(x){
	var div = inserisciMedia(x,"video");
	var vid = document.getElementById('video'+div.id);
	vid.style.height="inherit";
	vid.style.width="inherit";
	var width = vid.clientWidth;
	var height = vid.clientHeight;
	$(function() {
		$(div).resizable({
			aspectRatio: width / height
		});
	});
	return div;
}

var inserisciAudio=function(x){
	var div = inserisciMedia(x,"audio");

	var aud = document.getElementById('audio'+div.id);
	$(function() {
		$(div).resizable({
			aspectRatio: 1 / 1
		});
	});
	$("#"+div.id).css({"background":"url('src/img/nota.png') no-repeat", "background-size": "100% 100%"});;
	div.style.height="2em";
	div.style.width="2em";
	return div;
}


function resize(elem, percent) { elem.style.fontSize = percent; }

function portaAvanti(id){
	var original=$("#"+id).zIndex();
	$("#"+id).css({"z-index": original+1});
	if(original==0){
		document.getElementById("back"+id).style.opacity = '1';
		document.getElementById("back"+id).style.WebkitTransition = 'opacity 0.5s';
		document.getElementById("back"+id).style.MozTransition = 'opacity 0.5s';
	}
}

function mandaDietro(id){
	if($("#"+id).zIndex()>0){
		$("#"+id).css({"z-index": $("#"+id).zIndex()-1});
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
			var backgroundFrame=document.getElementById("backgroundFrame");
			backgroundFrame.setAttribute("onchange","document.getElementById('"+att+"').style.backgroundColor = '#'+this.color");
			var backgroundFrameEraser=document.getElementById("backgroundFrameEraser");
			backgroundFrameEraser.setAttribute("onclick","document.getElementById('"+att+"').style.removeProperty ('background')");
			var addToMain=document.getElementById("addToMain");
			if(!mainPath().contains(frames[i].id)){
				addToMain.removeAttribute("disabled");
				addToMain.setAttribute("onclick","mainPath().addToMainPath("+frames[i].id+")");

			}
			else{
				addToMain.setAttribute("disabled","disabled");
				
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

	var nid=parseInt(id);
	if (mainPath().getPercorso().indexOf(nid)>-1){

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
	var nid=parseInt(id);
	if (main.getPercorso().indexOf(nid)==-1){
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
			if(id==="content"){
				$("#content").css({"background":"url('"+e.target.result+"')"});
			}
			else{
				$("#"+id).css({"background":"url('"+e.target.result+"') no-repeat", "background-size": "100% 100%"});
			}


		}
		reader.readAsDataURL(input.files[0]);
	}
}

$("#contentBackgroundLoader").change(function(){
	backgroundReadURL(this, "content");
});
// IMMAGINE SFONDO

//IMMAGINE SFONDO
$("#frameBackgroundLoader").change(function(){
	backgroundReadURL(this, active().getId());
});
//IMMAGINE SFONDO

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
var scale=75;
function zoomIn(){
    
    var degrees = 0 - getRotationDegrees($("#" + active().getId()));
    if (degrees > 180)
        degrees=0-(360-degrees);
    scale=($("#content").height()/$("#"+active().getId()).height())*75;
    var z=scale;
    console.log(degrees);
    var nleft = parseFloat(document.getElementById(active().getId()).style.left) || 0;
    console.log("new left " + nleft);
    var ntop = parseFloat(document.getElementById(active().getId()).style.top) || 0;
    var elements = document.getElementById("frames").children;
    var xCenter=nleft+1/2*$("#"+active().getId()).width();
    var yCenter=ntop+1/2*$("#"+active().getId()).height();
    var rotLeft = (Math.cos((0-degrees) * Math.PI / 180) * (nleft - xCenter)) -
                   (Math.sin((0-degrees) * Math.PI / 180) * (ntop - yCenter)) +
                   xCenter;
   var rotTop = Math.sin(0-degrees * Math.PI / 180) * (nleft-xCenter) +
                   (Math.cos(0-degrees * Math.PI / 180) * (ntop-yCenter)) +
                   yCenter;
    console.log("rotLeft " + rotLeft);

    var percLeft = parseFloat(rotLeft) * 100 / $("#fantoccio").width();
    var percTop = parseFloat(rotTop) * 100 / $("#fantoccio").height();
    var oldHeight = $("#fantoccio").height();
    var oldWidth = $("#fantoccio").width();
    var transOrigin= percLeft+"% "+percTop+"%";

        $("#fantoccio").css({
            "zoom": z + "%",
            "height": oldHeight,
            "width" : oldWidth,
            "position": "absolute",
            "left": (0 - nleft) + "px",
            "top": (0 - ntop) + "px",
            "-ms-transform": "rotate(" + degrees + "deg)", /* IE 9 */
            "-webkit-transform":"rotate("+degrees+"deg)", /* Chrome, Safari, Opera */
            "transform": "rotate(" + degrees + "deg)",
            "-ms-transform-origin": transOrigin, /* IE 9 */
            "-webkit-transform-origin": transOrigin,
            "transform-origin": transOrigin,
            "-webkit-transition": "0.5s ease-in-out",
            "-moz-transition": "0.5s ease-in-out",
            "-o-transition": "0.5s ease-in-out",
            "transition": "0.5s ease-in-out"
            
        });

	
};

function zoomOut(){
	if(!active().getId()){
	scale=75;
	var z=scale+25;
	var degrees=0;
	var frames=$("#frames").children();
	$("#content").css({"overflow":"hidden"});
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
            left: (event.clientX - click.x + original.left)/(scale/75),
            top:  (event.clientY - click.y + original.top) /(scale/75)
        };
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
        change: function (event, ui) {
            $(ui.item[0].previousElementSibling).trigger("click");
            $(ui.item[0].nextElementSibling).trigger("click");
            console.log("New position: " + ui.item.index());
        },
        sort: function (event, ui) {
            mainPath().addToMainPath(mainPath().getAssociation($(ui.item[0]).attr("id")), ui.item.index());
            mainPath().removeFromMainPath(mainPath().getAssociation($(ui.item[0]).attr("id")));
            console.log(mainPath().getAssociation($(ui.item[0]).attr("id")), origin);
            
            console.log("New position: " + ui.item.index());
        }
    });
    $("#sortable").disableSelection();
});
