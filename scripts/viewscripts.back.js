var viewscripts = function(){


var val=0;
var contatore=0;

var that= {};

that.getRotationDegrees = function(obj) {

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

that.rotate = function (el,value) {
	document.getElementById(el).style.webkitTransform="rotate(" + value + "deg)";
	document.getElementById(el).style.msTransform="rotate(" + value + "deg)";
	document.getElementById(el).style.MozTransform="rotate(" + value + "deg)";
	document.getElementById(el).style.OTransform="rotate(" + value + "deg)";
	document.getElementById(el).style.transform="rotate(" + value + "deg)";
};



that.seleziona = function (id){
	clearMenu();
	document.getElementById(id).style.boxShadow= "0 0 0 0.25em black inset";

  		//document.getElementById(id).style.border="0.25em solid black";
  		document.getElementById("x"+id).style.opacity = '1';
  		document.getElementById("x"+id).style.WebkitTransition = 'opacity 0.5s';
  		document.getElementById("x"+id).style.MozTransition = 'opacity 0.5s';



  		document.getElementById("rotation").innerHTML="<input id=\"rangeRotation\" type=\"range\" min=\"0\" max=\"360\" step=\"1\" value=\""+getRotationDegrees($("#"+id))+"\" oninput=\"rotate('"+id+"',this.value)\">";


  	}


  	that.deseleziona = function (id){
  		clearMenu();
  		document.getElementById(id).style.boxShadow= "none";
  		document.getElementById("x"+id).style.opacity = '0';


  	}

  	that.clearMenu = function (){
  		var hideEles = document.getElementById("contextual-menu").children;
  		for(var i = 0; i < hideEles.length; i++) {
  			if(hideEles[i].id!="slideShowMenu")
  				hideEles[i].style.display="none";
  		}
  	}

  	that.elimina = function (id){
  		$("#"+id).remove();
  		document.getElementById("standardMenu").style.display="none";
  		clearMenu();
  	}

  	that.inserisciElemento=function(classe){
  		var div=document.createElement('div');
  		div.id=contatore;
  		div.style.position="absolute";
  		div.setAttribute("class", classe);
  		var idx="x"+contatore;
  		if(classe=="frame"){
  			document.getElementById("frames").appendChild(div);
  		}
  		else
  			document.getElementById("elements").appendChild(div);

	$(div).append("<img class=\"deleteButton\" id=\""+idx+"\" syle=\"text-align:center\" src=\"src/img/x.png\" onclick=\"elimina("+div.id+");\" width=\"20em\">");//inserisce immagine x
	contatore++;
	$(div).draggable(
	{
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
	return div;
}

that.inserisciFrame = function (){
	console.log("dio");
	var div=inserisciElemento("frame");
	$(function() {
		$( div ).resizable({
			aspectRatio: 1 / 1
		});
	});
}

that.inserisciTesto= function() {
	var text=document.getElementsByName("text")[0].value;

	var div=inserisciElemento("text");
	div.style.height="auto";
	var txt = document.createElement('div');
	txt.style.backgroundColor="rgba(0,0,0,0)";
	$(txt).resizable();
	div.setAttribute("contenteditable","true");
	txt.setAttribute("contenteditable","inherit");
	txt.id="txt"+div.id;

	txt.setAttribute("onFocus", "toggleElement(\"myNicPanel\")");
	txt.setAttribute("onBlur", "toggleElement(\"myNicPanel\")")
	$(div).append(txt);
	document.getElementsByName("text")[0].value="";
}

that.inserisciImmagine = function(x){
	var div = inserisciElemento("image");	    
	var img = document.createElement('img');
	img.setAttribute("class","resizable");
	var url="src/img/"+x;
	img.src=url;
	div.appendChild(img);	
	$(function() {
		$(img).resizable();
	});	
}

that.resize = function (elem, percent) { elem.style.fontSize = percent; }

that.toggleElement = function(id) { 
	if(document.getElementById(id).style.display==="inline"){
		document.getElementById(id).style.display="none";
	}
	else
		document.getElementById(id).style.display="inline";
}

that.hideElement= function (el){ 
	el.setAttribute("style", "display:none");
}

$(document).mousedown(function(e) {
	var frames = document.getElementById("frames").children;
	var selected="undefined";


	for(var i = 0; i < frames.length; i++)
	{

		if( $(event.target).is("#"+frames[i].id))
		{

			seleziona(frames[i].id);
			selected="frame";
		}
		else if($(event.target).is('#content') || $(event.target).parents().is('#frames')|| $(event.target).parents().is('#elements')){
			deseleziona(frames[i].id);
		}
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
			seleziona(elements[i].id);
		}

		else if($(event.target).is('#content') || $(event.target).parents().is('#frames') || $(event.target).parents().is("#elements")){
			
			deseleziona(elements[i].id);
		}
	}
	if(selected!="undefined"){
		document.getElementById("standardMenu").style.display="block";	
		document.getElementById(selected+"Menu").style.display="block";	
	}
});


document.onload= function(){
	var imageLoader = document.getElementById('imageLoader');
	imageLoader.addEventListener('change', handleImage, false);
	var canvas = document.getElementById('imageCanvas');
	var ctx = canvas.getContext('2d');


	that.handleImage = function (e){
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
}

return that;
};