function framePosition(left,top,width,screenWidth,screenHeight){
	console.log(left + " " + top + " " +width+" "+screenWidth+" "+screenHeight);
	var position=[(((left+(width/2))/screenWidth)*(7440*2)-7440),(((top+(width/2))/screenHeight)*(3600*2)-3600),((19.19*width)/screenWidth)];
	return position;
}
function imagePosition(left,top,waste,width,height,screenWidth,screenHeight){
	var scale=(19.19/screenWidth)*width;
	var position=[(((left+waste+(width/2))/screenWidth)*(7440*2)-7440),(((top+waste+(height/2))/screenHeight)*(3600*2)-3600)+(180/19.19)*scale,scale];
	return position;
}
function audioPosition(left,top,width,height,screenWidth,screenHeight){
	var position=[(((left+(width/2))/screenWidth)*(7440*2)-7440),(((top+(height/2))/screenHeight)*(3600*2)-3600),(19.19/screenWidth)*width];
	return position;
}
function videoPosition(left,top,waste,width,height,screenWidth,screenHeight){
	var scale=(19.19/screenWidth)*width;
	var position=[(((left+(width/2)+waste)/screenWidth)*(7440*2)-7440),(((top+(height/2)+waste)/screenHeight)*(3600*2)-3600)+(180/19.19)*scale,scale];
	return position;
}
function textPosition(left,top,waste,size,width,height,screenWidth,screenHeight){
	console.log(left + " " + top + " " +width+" "+height+" "+screenWidth+" "+screenHeight+" "+waste+" "+size);
	//var scale=(33.5/(1290/1899))*(size*14/screenWidth)*6.5;
	//scale=scale*0.95;
	//scale=3;
	var scale = (19.19/screenWidth)*width;
	if(!waste)
		waste=0;
	var position=[(((left+(width/2))/screenWidth)*(7440*2)-7440),(((top+(height/2))/screenHeight)*(3600*2)-3600)+(180/19.19)*scale,scale];
	return position;
}
//$.getJSON("slideshow.json", function(json) {
	var translateImpress = function(json){
		console.log("translator impress");
		var contStep=1;
		var choiceSteps=[];
		var presentation="";//<div id=\"impress\">";
		console.log(json);
		json = JSON.parse(json);
		console.log(json);
		if(json.proper.background.image!="0" && json.proper.background.image!= undefined)
			presentation+="<div class=\"step sfondo\" data-scale=\"10\"style=\"background: url('"+json.proper.background.url+"');background-size:100% 100%\"></div>";
		else if(json.proper.background.color!="0"&& json.proper.background.color!= undefined)
			presentation+="<div class=\"step sfondo\" data-scale=\"10\"style=\"background-color:"+json.proper.background.color+";\"></div>";
		else
			presentation+="<div class=\"step sfondo\" data-scale=\"10\"></div>";
		var oldFrames=[];
		for(i=0; i<json.proper.paths.main.length; i++){
			var ins=false;
			oldFrames=oldFrames.concat(json.proper.paths.main[i]);
			for(j=0; j<json.proper.paths.choices.length; j++){
				if(json.proper.paths.choices[j].pathId==json.proper.paths.main[i]){
					for(k=0; k<json.proper.paths.choices[j].choicePath.length; k++){
						for(s=0; json.proper.frames[s].id!=json.proper.paths.choices[j].choicePath[k]; s++){
						}
						var coordinates=framePosition(json.proper.frames[s].xIndex,json.proper.frames[s].yIndex,json.proper.frames[s].width,json.proper.background.width,json.proper.background.height);
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
					for(k=j+1; k<json.proper.paths.choices.length; k++){
						if(json.proper.paths.choices[k].pathId==json.proper.paths.choices[j].pathId)
							other=true;
					}
					for(k=0; json.proper.frames[k].id!=json.proper.paths.choices[j].pathId; k++){
					}
					var coordinates=framePosition(json.proper.frames[k].xIndex,json.proper.frames[k].yIndex,json.proper.frames[k].width,json.proper.background.width,json.proper.background.height);
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
						for(k=0; k<json.proper.paths.choices.length; k++){
							if(json.proper.paths.choices[j].pathId==json.proper,paths.main[i]){
								choices=choices.concat(json.proper.paths.choices[j].name)
							}
						}
						for(k=0; k<choiceSteps.length; k++){
							presentation+="<input type=button onClick=\"parent.location='"+window.location.href +"#/step-"+choiceSteps[k]+"'\" value='"+choices[k]+"'>";
						}
						presentation+="</div>";
						contStep++;
					}
				}
			}
			if(!ins){
				console.log(i);
				var coordinates=framePosition(json.proper.frames[i].xIndex,json.proper.frames[i].yIndex,json.proper.frames[i].width,json.proper.background.width,json.proper.background.height);
				var style="style=\"z-index:"+json.proper.frames[i].zIndex+";";//c'era [k]
				var bi=bc="";
				if(json.proper.frames[i].image!="")
					bi="background: url('"+json.proper.frames[i].image+"'); background-size:100% 100%;";
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
		for(i=0; i<json.proper.frames.length; i++){
			var found=false;
			for(j=0; j<oldFrames.length; j++)
				if(oldFrames[i]==json.proper.frames[i].id)
					found=true;
				if(!found){
					var coordinates=framePosition(json.proper.frames[i].xIndex,json.proper.frames[i].yIndex,json.proper.frames[i].width,json.proper.background.width,json.proper.background.height);
					var style="style=\"z-index:"+json.proper.frames[i].zIndex+";";
					var bi=bc="";
					if(json.proper.frames[i].image!="")
						bi="background: url('"+json.proper.frames[i].image+"'); background-size:100% 100%;";
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
			for(i=0; i<json.proper.images.length; i++){
				var coordinates=imagePosition(json.proper.images[i].xIndex,json.proper.images[i].yIndex,json.proper.images[i].waste,json.proper.images[i].width,json.proper.images[i].height,json.proper.background.width,json.proper.background.height);
				var style="style=\"z-index:"+json.proper.images[i].zIndex+";\"";
				presentation+="<div class=\"step immagine\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" "+style+"><img src=\""+json.proper.images[i].ref+"\"/></div>";
			}
			for(i=0; i<json.proper.audios.length; i++){
				var coordinates=audioPosition(json.proper.audios[i].xIndex,json.proper.audios[i].yIndex,json.proper.audios[i].width,json.proper.audios[i].height,json.proper.background.width,json.proper.background.height);
				var style="style=\"z-index:"+json.proper.audios[i].zIndex+";\"";
				presentation+="<div class=\"step audio\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" "+style+"><audio src=\""+json.proper.audios[i].ref+"\" controls/></div>";
			}
			for(i=0; i<json.proper.videos.length; i++){
				var coordinates=videoPosition(json.proper.videos[i].xIndex,json.proper.videos[i].yIndex,json.proper.videos[i].waste,json.proper.videos[i].width,json.proper.videos[i].height,json.proper.background.width,json.proper.background.height);
				var style="style=\"z-index:"+json.proper.videos[i].zIndex+";\"";
				presentation+="<div class=\"step video\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" "+style+"><video src=\""+json.proper.videos[i].ref+"\" controls/></div>";
			}
			for(i=0; i<json.proper.texts.length; i++){
				var coordinates=textPosition(json.proper.texts[i].xIndex,json.proper.texts[i].yIndex,json.proper.texts[i].waste,json.proper.texts[i].fontSize,json.proper.texts[i].width,json.proper.texts[i].height,json.proper.background.width,json.proper.background.height);
				var style="style=\"z-index:"+json.proper.texts[i].zIndex+";color:"+json.proper.texts[i].color+";\"";
				presentation+="<div class=\"step testo\" data-x=\""+coordinates[0]+"\" data-y=\""+coordinates[1]+"\" data-scale=\""+coordinates[2]+"\" "+style+">";
				var width = json.proper.texts[i].width ;
				var height = json.proper.texts[i].height;
				var styleQ="style=\"text-align:left;width:"+width+"px;height:"+height+"px;top:0em;left:0em;display:block;font-size:"+(json.proper.texts[i].fontSize*14)+"px;\"";
				presentation+="<p "+styleQ+">"+json.proper.texts[i].content+"</p></div>";
			}
			console.log(presentation);
			//presentation+="</div>";

			$("#impress").append(presentation);
			var api=impress();
			api.init();
			api.showMenu();
		};