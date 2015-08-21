
var doc = document.documentElement;

var posX = 0;
var posY = 0;

// This is better
$(document).mousemove(function(e){
	// $('#status').html(e.pageX +', '+ e.pageY);
	posX = e.pageX;
	posY = e.pageY;
});

doc.ondragover = function () {
	this.className = 'hover';
	return false;
};

doc.ondragend = function (){
	this.className = '';
	return false;
};

doc.ondrop = function (event) {
	event.preventDefault && event.preventDefault();
	this.className = '';
	//class progress and position

	// now do something with:
	//var file = event.dataTransfer.files[0];
	var files = event.dataTransfer.files;

	var spec = {
		xIndex: posX,
		yIndex: posY
	}

	angular.element($("#content")).scope().dragMedia(files, spec);

	/*var filename = file.name;
	window.URL.createObjectURL(file);
	var formData = new FormData();
	formData.append('file', file);*/

	// now post a new XHR request
	/*var xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://localhost:8081/private/api/files/'+filename);
	xhr.setRequestHeader("Authorization", token);
	xhr.onload = function () {
		var spec = {
			filename : filename,
			type : file.type,
			xIndex: posX,
			yIndex: posY
		};
		angular.element($("#content")).scope().dragMedia(spec);
	};
	/*xhr.upload.onprogress = function (event) {
		if (event.lengthComputable) {
			var complete = (event.loaded / event.total * 100 | 0);
			progress.value = progress.innerHTML =  complete;
		}
	};*//*
	xhr.send(formData);*/

	return false;
};
