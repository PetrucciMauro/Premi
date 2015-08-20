var assert = require("assert");
var MongoClient = require('mongodb').MongoClient;
var database = "mongodb://localhost/premi";
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var host = "http://localhost:8081";
var fs = require('fs');
var path = require('path');
var rmdir = require('rimraf');

var config = function(done){
	MongoClient.connect(database, function(err, db) {
							  db.collection('users').remove({}, function(err, doc){
																	  if(err) return done(err);
																	  var dir= __dirname+'/../files/';
																	  rmdir.sync(dir);
																	  fs.mkdirSync(dir);
																	  done();
																	  });
							  });
};

beforeEach(function(done) {
			  config(done);
			  });

after(function(done) {
		config(done);
		});

var register = function(req){
	req.open('POST', host+'/account/register', false);
	req.setRequestHeader("Authorization", "provaname"+":"+"provapass");
	req.send();
};
var authenticate = function(req){
	req.open('GET', host+'/account/authenticate', false);
	req.setRequestHeader("Authorization", "provaname"+":"+"provapass");
	req.send();
};

describe("File Server images", function(){
			
			it("Images meta", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");

				fs.openSync(path.normalize(__dirname+'/../files/provaname/image/provaFile'),"w");
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/image', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal('provaFile', jsonResponse.names[0]);
				});
 
			it("Image delete", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				fs.openSync(path.normalize(__dirname+'/../files/provaname/image/provaFile'),"w");
				
				var req = new XMLHttpRequest();
				req.open('DELETE', host+'/private/api/files/image/provaFile', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				assert(200, req.status);
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/image', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal(0, jsonResponse.names.length);

				});
			
			it("Image insert", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");

				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/files/image/provaFile', false);
				req.setRequestHeader("Authorization", token);
				
				var boundary = "----------------------------344cf"
				req.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
				var body = '';
				body += '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="file"; filename="afile"';
				body += "data";
				body += '"\r\n\r\n';
				body += JSON.stringify({"file2" : {"provatesto":"testodiprova"}});
				body += '\r\n'
				body += '--' + boundary + '--';
				
				req.send(body);
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/image', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal(1, jsonResponse.names.length);

				});
			
			it("Image rename", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				fs.openSync(path.normalize(__dirname+'/../files/provaname/image/provaFile'),"w");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/files/image/provaFile/renamedFile', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				assert.equal(200, req.status);
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/image', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal('renamedFile', jsonResponse.names[0]);
        });
         
      it("ImageSize", function(done){
            var req = new XMLHttpRequest();
            register(req);
            
            var req = new XMLHttpRequest();
            authenticate(req);
            var token = req.getResponseHeader("Authorization");
         
            var base64Data = "/9j/4AAQSkZJRgABAQEASABIAAD/4QDIRXhpZgAATU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAAYgEbAAUAAAABAAAAagEoAAMAAAABAAIAAAExAAIAAAAQAAAAcgEyAAIAAAAUAAAAgodpAAQAAAABAAAAlgAAAAAAAABIAAAAAQAAAEgAAAABUXVpY2tUaW1lIDcuNi42ADIwMTE6MDE6MTkgMTM6MzM6MDcAAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAC+gAwAEAAAAAQAAACEAAAAA/+EJkWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iUXVpY2tUaW1lIDcuNi42IiB4bXA6TW9kaWZ5RGF0ZT0iMjAxMS0wMS0xOVQxMzozMzowNyIvPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz4A/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAA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"
            fs.writeFile("files/provaname/image/prova.png", base64Data, 'base64', function(err) {
                                 console.log(err);
                         
                         var req = new XMLHttpRequest();
                         req.open('GET', host+'/private/api/files/sizeImage/prova.png', false);
                         req.setRequestHeader("Authorization", token);
                         req.send();
                         assert.equal(200, req.status);
                         var jsonResponse = JSON.parse(req.responseText);
                         assert.equal(33, jsonResponse.width);
                         assert.equal(47, jsonResponse.height);
                         done();
                         
                         });
			
			});
});

describe("File Server audios", function(){
			
			it("Audios meta", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
								
				fs.openSync(path.normalize(__dirname+'/../files/provaname/audio/provaFile'),"w");
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/audio', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal('provaFile', jsonResponse.names[0]);
				});
			
			it("Audio delete", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				fs.openSync(path.normalize(__dirname+'/../files/provaname/audio/provaFile'),"w");
				
				var req = new XMLHttpRequest();
				req.open('DELETE', host+'/private/api/files/audio/provaFile', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/audio', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal(0, jsonResponse.names);
				
				});
			
			it("Audio insert", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/files/audio/provaFile', false);
				req.setRequestHeader("Authorization", token);
				
				var boundary = "----------------------------344cf"
				req.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
				var body = '';
				body += '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="file"; filename="afile"';
				body += "data";
				body += '"\r\n\r\n';
				body += JSON.stringify({"file2" : {"provatesto":"testodiprova"}});
				body += '\r\n'
				body += '--' + boundary + '--';
				
				req.send(body);
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/audio', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal(1, jsonResponse.names.length);
				
				});
			
			it("Audio rename", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				fs.openSync(path.normalize(__dirname+'/../files/provaname/audio/provaFile'),"w");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/files/audio/provaFile/renamedFile', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				assert.equal(200, req.status);
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/audio', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal('renamedFile', jsonResponse.names[0]);
				});
			});

describe("File Server videos", function(){
			
			it("Videos meta", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				fs.openSync(path.normalize(__dirname+'/../files/provaname/video/provaFile'),"w");
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/video', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal('provaFile', jsonResponse.names[0]);
				});
			
			it("Video delete", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				fs.openSync(path.normalize(__dirname+'/../files/provaname/video/provaFile'),"w");
				
				var req = new XMLHttpRequest();
				req.open('DELETE', host+'/private/api/files/video/provaFile', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				assert.equal(200, req.status);
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/video', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal(0, jsonResponse.names);

				});
			
			it("Video insert", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/files/video/provaFile', false);
				req.setRequestHeader("Authorization", token);
				
				var boundary = "----------------------------344cf"
				req.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
				var body = '';
				body += '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="file"; filename="afile"';
				body += "data";
				body += '"\r\n\r\n';
				body += JSON.stringify({"file2" : {"provatesto":"testodiprova"}});
				body += '\r\n'
				body += '--' + boundary + '--';
				
				req.send(body);
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/video', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal(1, jsonResponse.names.length);
				
				});
			
			it("Video rename", function(){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				fs.openSync(path.normalize(__dirname+'/../files/provaname/video/provaFile'),"w");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/files/video/provaFile/renamedFile', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				assert.equal(200, req.status);
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/files/video', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(200, req.status);
				assert.equal(true, jsonResponse.success);
				assert.equal('renamedFile', jsonResponse.names[0]);
				});
			});
						
						




