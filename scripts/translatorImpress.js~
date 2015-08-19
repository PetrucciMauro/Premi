var screenWidth = 0;
var screenHeight = 0;

function framePosition(left,top,width){
	console.log(left + " " + top + " " +width+" "+screenWidth+" "+screenHeight);
	var position=[(((left+(width/2))/screenWidth)*(7440*2)-7440),(((top+(width/2))/screenHeight)*(3600*2)-3600),((19.19*width)/screenWidth)];
	return position;
}
function imagePosition(left,top,waste,width,height){
	var scale=(19.19/screenWidth)*width;
	var position=[(((left+waste+(width/2))/screenWidth)*(7440*2)-7440),(((top+waste+(height/2))/screenHeight)*(3600*2)-3600)+(180/19.19)*scale,scale];
	return position;
}
function audioPosition(left,top,width,height){
	var position=[(((left+(width/2))/screenWidth)*(7440*2)-7440),(((top+(height/2))/screenHeight)*(3600*2)-3600),(19.19/screenWidth)*width];
	return position;
}
function videoPosition(left,top,waste,width,height){
	var scale=(19.19/screenWidth)*width;
	var position=[(((left+(width/2)+waste)/screenWidth)*(7440*2)-7440),(((top+(height/2)+waste)/screenHeight)*(3600*2)-3600)+(180/19.19)*scale,scale];
	return position;
}
function textPosition(left,top,waste,size,width,height){
	console.log(left + " " + top + " " +width+" "+height+" "+screenWidth+" "+screenHeight+" "+waste+" "+size);
	//var scale=(33.5/(1290/1899))*(size*14/screenWidth)*6.5;
	//scale=scale*0.95;
	//scale=3;
	var widthPerc = width/height;
	var heightPerc = height/width;
	var divide = widthPerc + heightPerc;
	var scale = ((18/screenWidth)*width*heightPerc + (18/screenHeight)*height*widthPerc)/divide;
	var textPadding = 100;
	console.log(width/height);
	console.log(height/width);
	if(!waste)
		waste=0;
	//var position=[(((left+(width/2))/screenWidth)*(7440*2)-7440),(((top+(height/2))/screenHeight)*(3600*2)-3600)+(180/19.19)*scale,scale];
	//var position=[(((left+(width/2))/screenWidth)*(7440*2)-7440+textPadding),(((top+(height/2))/screenHeight)*(3600*2)-3600+textPadding),scale];
	var position=[(((left+(width/2))/screenWidth)*(7440*2)-7440),(((top+(width/2))/screenHeight)*(3600*2)-3600),((19.19*width)/screenWidth)];
		return position;
	}

var translateImpress = function(json){
	console.log("translator impress");
	var contStep=1;
	var choiceSteps=[];
	var presentation="";//<div id=\"impress\">";
	json = JSON.parse(json);
	console.log(json);

	var defaultSize = getDefaultFontSize();

	var background = json.proper.background;

	screenWidth = background.width;
	screenHeight = background.height;

	if(isUndefined(screenWidth) || isUndefined(screenHeight))
		throw new Error("Attenzione! il background non è definito correttamente.");

	var backStyle = "";
	if(isObject(background.image))
		backStyle += "background: url('"+background.image+"');background-size:100% 100%;";
	if(isObject(background.color))
		backStyle += "background-color:"+background.color+";";
	
	if(backStyle != "")
		backStyle = "style=\"" + backStyle + "\"";
	
	presentation+="<div class=\"step sfondo\" data-scale=\"10\" "+backStyle+"></div>";

	var oldFrames=[];
	for(i=0; i<json.proper.paths.main.length; ++i){
		var ins=false;
		oldFrames=oldFrames.concat(json.proper.paths.main[i]);
		for(j=0; j<json.proper.paths.choices.length; ++j){
			if(json.proper.paths.choices[j].pathId==json.proper.paths.main[i]){
				for(k=0; k<json.proper.paths.choices[j].choicePath.length; ++k){
					for(s=0; json.proper.frames[s].id!=json.proper.paths.choices[j].choicePath[k]; s++){
					}
					var coordinates=framePosition(json.proper.frames[s].xIndex,json.proper.frames[s].yIndex,json.proper.frames[s].width);
					var style="style=\"z-index:"+json.proper.frames[s].zIndex+";";
					var bi=bc="";
					if(json.proper.frames[s].image!="")
						bi="background: url('"+json.proper.frames[k].image+"'); background-size:100% 100%;";
					console.log(json.proper.frames[s].color);
					if(json.proper.frames[s].color!="")
						bc="background-color:"+json.proper.frames[s].color+";";
					style+=bi+bc+"\"";
					contStep++;
					if(k==0)
						choiceSteps=choiceSteps.concat(contStep);
					presentation+="<div class=\"step frame scelta\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" ";
					if(json.proper.frames[s].rotation != 0){
						presentation+="data-rotate=\"" + json.proper.frames[s].rotation + "\"";
					}
					presentation+=style+"></div>";
				}
				var other=false;
				for(k=j+1; k<json.proper.paths.choices.length; ++k){
					if(json.proper.paths.choices[k].pathId==json.proper.paths.choices[j].pathId)
						other=true;
				}
				for(k=0; json.proper.frames[k].id!=json.proper.paths.choices[j].pathId; ++k){
				}
				var coordinates=framePosition(json.proper.frames[k].xIndex,json.proper.frames[k].yIndex,json.proper.frames[k].width);
				var style="style=\"z-index:"+json.proper.frames[k].zIndex+";";
				var bi=bc="";
				if(json.proper.frames[k].image!="")
					bi="background: url('"+json.proper.frames[k].image+"'); background-size:100% 100%;";
				if(json.proper.frames[k].color!="")
					bc="background-color:"+json.proper.frames[s].color+";";
				style+=bi+bc+"\"";
				var bookmark="";
				if(json.proper.frames[k].bookmark)
					bookmark=" bookmark ";
				ins=true;
				if(other){
					contStep++;
					presentation+="<div class=\"step frame"+bookmark+"\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" ";
					if(json.proper.frames[k].rotation != 0){
						presentation+="data-rotate=\"" + json.proper.frames[k].rotation + "\"";
					}
					presentation+=style+"></div>";
				}
				else{
					presentation+="<div class=\"step frame copia"+bookmark+"\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" ";
					if(json.proper.frames[k].rotation != 0){
						presentation+="data-rotate=\"" + json.proper.frames[k].rotation + "\"";
					}
					presentation+=style+"></div>";
					var choices=[];
					for(k=0; k<json.proper.paths.choices.length; ++k){
						if(json.proper.paths.choices[j].pathId==json.proper,paths.main[i]){
							choices=choices.concat(json.proper.paths.choices[j].name)
						}
					}
					for(k=0; k<choiceSteps.length; ++k){
						presentation+="<input type=button onClick=\"parent.location='"+window.location.href +"#/step-"+choiceSteps[k]+"'\" value='"+choices[k]+"'>";
					}
					presentation+="</div>";
					contStep++;
				}
			}
		}
		if(!ins){
			console.log(i);
			var coordinates=framePosition(json.proper.frames[i].xIndex,json.proper.frames[i].yIndex,json.proper.frames[i].width);
			var style="style=\"z-index:"+json.proper.frames[i].zIndex+";";//c'era [k]
			var bi=bc="";
			if(json.proper.frames[i].ref!="")
				bi="background: url('"+json.proper.frames[i].ref+"'); background-size:100% 100%;";
			if(json.proper.frames[i].color!="")
				bc="background-color:"+json.proper.frames[i].color+";";
			style+=bi+bc+"\"";
			contStep++;
			var bookmark="";
			if(json.proper.frames[i].bookmark)
				bookmark=" bookmark ";
			presentation+="<div class=\"step frame"+bookmark+"\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" ";
			if(json.proper.frames[i].rotation != 0){
				presentation+="data-rotate=\"" + json.proper.frames[i].rotation + "\"";
			}
			presentation+=style+"></div>";
		}
	}
	for(i=0; i<json.proper.frames.length; ++i){
		var found=false;
		for(j=0; j<oldFrames.length; j++)
			if(oldFrames[i]==json.proper.frames[i].id)
				found=true;
			if(!found){
				var coordinates=framePosition(json.proper.frames[i].xIndex,json.proper.frames[i].yIndex,json.proper.frames[i].width);
				var style="style=\"z-index:"+json.proper.frames[i].zIndex+";";
				var bi=bc="";
				if(json.proper.frames[i].ref!="")
					bi="background: url('"+json.proper.frames[i].ref+"'); background-size:100% 100%;";
				if(json.proper.frames[i].color!="")
					bc="background-color:"+json.proper.frames[i].color+";";
				style+=bi+bc+"\"";
				contStep++;
				var bookmark="";
				if(json.proper.frames[i].bookmark)
					bookmark=" bookmark ";
				presentation+="<div class=\"step extraFrame"+bookmark+"\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" ";
				if(json.proper.frames[i].rotation != 0){
					presentation+="data-rotate=\"" + json.proper.frames[i].rotation + "\"";
				}
				presentation+=style+"></div>";
			}
		}
		for(i=0; i<json.proper.images.length; ++i){
			var image = json.proper.images[i];
			
			var coordinates=imagePosition(image.xIndex,image.yIndex,image.waste,image.width,image.height);
			var style="style=\"z-index:"+image.zIndex+";\"";
			
			presentation+="<div class=\"step immagine\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" "+style+"><img src=\""+image.ref+"\"/></div>";
		}
		for(i=0; i<json.proper.audios.length; ++i){
			var audio = json.proper.audios[i];
			
			var coordinates=audioPosition(audio.xIndex,audio.yIndex,audio.width,audio.height);
			var style="style=\"z-index:"+audio.zIndex+";\"";
			
			presentation+="<div class=\"step audio\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" "+style+"><audio src=\""+audio.ref+"\" controls/></div>";
		}
		for(i=0; i<json.proper.videos.length; ++i){
			var video = json.proper.videos[i];
			
			var coordinates=videoPosition(video.xIndex,video.yIndex,video.waste,video.width,video.height);
			var style="style=\"z-index:"+video.zIndex+";\"";
			
			presentation+="<div class=\"step video\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" "+style+"><video src=\""+video.ref+"\" controls/></div>";
		}
		for(i=0; i<json.proper.texts.length; ++i){
			var text = json.proper.texts[i];

			var coordinates=textPosition(text.xIndex,text.yIndex,text.waste,text.fontSize,text.width,text.height);

			var style="style=\"z-index:"+text.zIndex+";\"";
			presentation+="<div class=\"step testo\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" "+style+">";

			var height = text.height/defaultSize;
			var width = text.width/defaultSize;

			var styleQ="style=\"text-align:left;width:"+width+"em;height:"+height+"em;top:0em;left:0em;display:block;font-size:"+text.fontSize+"em;color:"+text.color+";font-family:"+text.font+";\"";
			presentation+="<p "+styleQ+">"+text.content+"</p></div>";
		}
		console.log(presentation);
		//presentation+="</div>";

		$("#impress").append(presentation);
		var api=impress();
		api.init();
		api.showMenu();
	};

function isUndefined(object){
	var ris = false;

	if(!object || object=="")
		ris = true;
	else if(object == undefined)
		ris = true;
	else if(object == null)
		ris = true;
	else if(object == "undefined")
		ris = true;
	else if(object == "null")
		ris = true;

	return ris;
}

function isObject(object){
	return !isUndefined(object);
}

function getDefaultFontSize(pa){
	pa= pa || document.body;
	var who= document.createElement('div');

	who.style.cssText='display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden; font-size:1em';

	who.appendChild(document.createTextNode('M'));
	pa.appendChild(who);
	var fs= who.offsetHeight;
	pa.removeChild(who);

	return fs;
}
