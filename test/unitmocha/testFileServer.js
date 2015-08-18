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
						
						




