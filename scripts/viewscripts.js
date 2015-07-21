
var contatore=0;

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
		};
		that.getId=function(){
			return private.id;
		};
		that.deselect=function(){
			clearMenu();
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

		that.removeFromMainPath=function(id, position){
			var index=new Array();
			for(var i = 0; i<private.percorso.length; i++){
				if (private.percorso[i]==id){
					index.push(i);
				}
			}
			var pos=position || index[index.length-1];
			var popped;
			if(index.length){
				popped=private.percorso.splice(pos, 1);
			}
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

		that.contains=function(id){
			var contiene=false;
			if (private.percorso.indexOf(parseInt(id))>-1){

				contiene=true;
			}
			return contiene;
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
		if(hideEles[i].id!="slideShowMenu")
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
	$(div).draggable(
	{
		start: function(event, ui) {
        // Log start dragged position to element data
        
    },

		drag: function(){
			var offset = $(this).offset();
			var xPos = offset.left;
			var yPos = offset.top;
			var thisId = $(this).attr('id');
			$('#' + thisId + ' .posX').text(xPos);
			$('#' + thisId + ' .posY').text(yPos);
		}
	}
	);
	$(".droppable").droppable({
		drop: function(event, ui) {
			if($(ui.draggable).hasClass("frame")){
				$(ui.draggable).css({top: yInit, left: xInit, position:'absolute', width: widthInit, height:heightInit});
			}
		},
		over: function(event, ui) {
			heightInit=$(ui.draggable).height();
			widthInit=$(ui.draggable).width();
			if($(ui.draggable).hasClass("frame")){
				$(ui.draggable).animate({
					width: '3em',
					height: '3em'
				}, 300);
			}

            /*$(this).mousemove(function(e) {
            	console.log("ciao");
        $(div).show(2000);
         $(div).css({position:"absolute", left:e.pageX,top:e.pageY});

     });*/


},

out: function(event, ui) {
	if($(ui.draggable).hasClass("frame")){
		$(ui.draggable).animate({
			width: widthInit,
			height: heightInit
		}, 300);
	}
}
});
	return div;
}

var inserisciFrame=function(){
	var div=inserisciElemento("frame");
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


var inserisciImmagine=function(x){
	var div = inserisciElemento("image");	    
	var img = document.createElement('img');
	img.setAttribute("class","resizable");
	img.id="img"+contatore;
	var url=x; //SFOGLIA FILE
	img.src=url;
	div.appendChild(img);
	var img = document.getElementById('img'+contatore);
	var width = img.clientWidth;
	var height = img.clientHeight;
	$(function() {
		$(img).resizable({
			aspectRatio: width / height
		});
	});
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
			backgroundFrameEraser.setAttribute("onclick","document.getElementById('"+att+"').style.backgroundColor = 'transparent'");
			var addToMain=document.getElementById("addToMain");
			if(!mainPath().contains(frames[i].id)){

				addToMain.setAttribute("onclick","mainPath().addToMainPath("+frames[i].id+")");

			}
			else{

				
			}
			//SFONDO FRAME
		}
		else if($(event.target).is('#content') || $(event.target).parents().is('#elements'))
			active().deselect();
	}
	
	var elements = document.getElementById("elements").children;
	for(var i = 0; i < elements.length; i++) 
	{
		

		if( $(event.target).is("#"+elements[i].id) || $(event.target).parents().is("#"+elements[i].id))
		{

			if($(event.target).hasClass("image")||$(event.target).parents().hasClass("image"))
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

		else if($(event.target).is('#content') || $(event.target).parents().is('#frames') || $(event.target).parents().is("#elements")){
			
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
function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		reader.onload = function (e) {
      
                inserisciImmagine(e.target.result);
            }
            
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    $("#imgLoader").change(function(){
    	readURL(this);
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