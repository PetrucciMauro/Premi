
var contatore=0;


var mainPathInstance={};
var mainPathInstanced=false;
var active;
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
			if (private.percorso.indexOf(id)>-1){
				contiene=true;
			}
			return contiene;
		}
		mainPathInstance=that;
	}

	return mainPathInstance;
}

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



function seleziona(id){
	clearMenu();
	delete active;
	document.getElementById(id).style.boxShadow= "0 0 0 0.25em black inset";

  		//document.getElementById(id).style.border="0.25em solid black";
  		document.getElementById("x"+id).style.opacity = '1';
  		document.getElementById("x"+id).style.WebkitTransition = 'opacity 0.5s';
  		document.getElementById("x"+id).style.MozTransition = 'opacity 0.5s';

  		document.getElementById("rotation").innerHTML="<input id=\"rangeRotation\" type=\"range\" min=\"0\" max=\"360\" step=\"1\" value=\""+getRotationDegrees($("#"+id))+"\" oninput=\"rotate('"+id+"',this.value)\">";
  		active=id;


  	}


  	function deseleziona(id){
  		clearMenu();
  		document.getElementById(id).style.boxShadow= "none";
  		document.getElementById("x"+id).style.opacity = '0';


  	}

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

var inserisciFrame=function(){
	console.log("sono in inserisciFrame");
	var div=inserisciElemento("frame");
	$(function() {
		$( div ).resizable({
			aspectRatio: 1 / 1
		});
	});
	console.log("div è: "+div);
	return div;
}

var inserisciTesto=function(){
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
	return div;
}

var inserisciImmagine=function(x){
	var div = inserisciElemento("image");	    
	var img = document.createElement('img');
	img.setAttribute("class","resizable");
	img.id="img"+contatore;
	var url=x; //SFOGLIA FILE
	img.src=url;
	div.appendChild(img);
	/*SFOGLIA FILE
	$(function() {
		$(img).resizable();
	});
*/
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
			deselezionaPercorso(frames[i].id);

			seleziona(frames[i].id);
			selezionaPercorso(frames[i].id);
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
				addToMain.style.display("none");
			}
			//SFONDO FRAME
		}
		else if($(event.target).is('#content') || $(event.target).parents().is('#frames')|| $(event.target).parents().is('#elements')){
			if(!$(event.target).parents().is('#frames')){
				deselezionaPercorso("undef");

			}
			else{
				selezionaPercorso(frames[i].id);
			}
			deseleziona(frames[i].id);
		}
	}
	var elements = document.getElementById("elements").children;
	for(var i = 0; i < elements.length; i++) 
	{
		delete active;

		if( $(event.target).is("#"+elements[i].id) || $(event.target).parents().is("#"+elements[i].id))
		{

			deselezionaPercorso("undef");
			if($(event.target).hasClass("image")||$(event.target).parents().hasClass("image"))
				selected="media";
			else if($(event.target).hasClass("SVG")||$(event.target).parents().hasClass("SVG"))
				selected="SVG";
			else if($(event.target).hasClass("text")||$(event.target).parents().hasClass("text"))
				selected="text";
			seleziona(elements[i].id);
			//SFONDO FRAME
			document.getElementById("backgroundFrame").removeAttribute("onchange");
			//SFONDO FRAME
		}

		else if($(event.target).is('#content') || $(event.target).parents().is('#frames') || $(event.target).parents().is("#elements")){
			if(!$(event.target).parents().is('#frames'))
				deselezionaPercorso("undef");
			else
			deseleziona(elements[i].id);
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
});



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
                //$('#blah').attr('src', e.target.result);
                inserisciImmagine(e.target.result);
            }
            
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    $("#imgLoader").change(function(){
    	readURL(this);
    });
//SFOGLIA FILE