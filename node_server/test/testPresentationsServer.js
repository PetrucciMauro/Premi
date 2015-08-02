var assert = require("assert");
var MongoClient = require('mongodb').MongoClient;
var database = "mongodb://localhost/premi";
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var host = "http://localhost:8080";
var fs = require('fs');
var path = require('path');
var rmdir = require('rimraf');

var config = function(done){
	MongoClient.connect(database, function(err, db) {
							  db.collection('users').remove({}, function(err, doc){
																	  if(err) return done(err);
																	  db.collection('presentationsprovaname').remove({}, function(err, doc){
																																	 var dir= __dirname+'/../files/';
																																	 rmdir.sync(dir);
																																	 fs.mkdirSync(dir);
																																	 done();
																																	 });
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

describe("Presentations", function(){
			
			it("PresentationMeta", function(done){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').insert({'meta': {'name': 'presentazione_prova'}, 'proper': {} }, function(err, doc){
																											 if(err) return done(err);
																											 assert.notEqual(null, doc);
																											 
																											 var req = new XMLHttpRequest();
																											 req.open('GET', host+'/private/api/presentations', false);
																											 req.setRequestHeader("Authorization", token);
																											 req.send();
																											 var jsonResponse = JSON.parse(req.responseText);
																											 
																											 assert.equal(200, req.status);
																											 assert.equal('presentazione_prova', jsonResponse.message[0].name);
																											 done();

																											 });
										  });
				
				});
			
			it("NewPresentation", function(done){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  assert.equal('presentazione_prova', doc.meta.name);
																											  done();
																											  });
										  });
				});
			
			it("NewCopyPresentation", function(done){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  var id_presentation = doc._id;
																											  var req = new XMLHttpRequest();
																											  req.open('POST', host+'/private/api/presentations/new/presentazione_copia/'+id_presentation, false);
																											  req.setRequestHeader("Authorization", token);
																											  req.send();
																											  assert.equal(200, req.status);
																											  
																											  MongoClient.connect(database, function(err, db) {
																																		 db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_copia'}, function(err, doc){
																																																			 if(err) return done(err);
																																																			 assert.notEqual(null, doc);
																																																			 done();
																																																			 });
																																		 });
																											  });
										  });
				});
			
			it("GetPresentation", function(done){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  var id_presentation = doc._id;

																											  var req = new XMLHttpRequest();
																											  req.open('GET', host+'/private/api/presentations/'+id_presentation, false);
																											  req.setRequestHeader("Authorization", token);
																											  req.send();
																											  var jsonResponse = JSON.parse(req.responseText);
																											  
																											  assert.equal('presentazione_prova', jsonResponse.message.meta.name);
																											  done();
																											  });
										  });
				});
			
			it("DeletePresentation", function(done){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  var id_presentation = doc._id;

																											  var req = new XMLHttpRequest();
																											  req.open('DELETE', host+'/private/api/presentations/'+id_presentation, false);
																											  req.setRequestHeader("Authorization", token);
																											  req.send();
																											  assert.equal(200, req.status);
																											  
																											  MongoClient.connect(database, function(err, db) {
																																		 db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_prova'}, function(err, doc){
																																																			 if(err) return done(err);
																																																			 assert.equal(null, doc);
																																																			 done();
																																																			 });
																																		 });
																											  });
										  });
				});
			
			
			it("RenamePresentation", function(done){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();

				
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  var id_presentation = doc._id;
																											  
																											  var req = new XMLHttpRequest();
																											  req.open('POST', host+'/private/api/presentations/'+id_presentation+'/rename/presentazione_renamed', false);
																											  req.setRequestHeader("Authorization", token);
																											  req.send();
																											  assert.equal(200, req.status);
																											  
																											  db.collection('presentations'+'provaname').findOne({'_id' : id_presentation}, function(err, doc){
																																												  if(err) return done(err);
																																												  assert.equal('presentazione_renamed',doc.meta.name);
																																												  done();
																																												  });
																											  });
										  });
				});
		
			});

describe("Presentation's elements", function(){
		
			it("PostElement", function(done){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();

				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  var id_presentation = doc._id;
				
																											  var req = new XMLHttpRequest();
																											  req.open('POST', host+'/private/api/presentations/'+id_presentation+'/element', false);
																											  req.setRequestHeader("Authorization", token);
																											  req.setRequestHeader("Content-Type", 'Application/json');
																											  var body = { "element": {
																											  "id": 3,
																											  "xIndex": 10,
																											  "yIndex": 20,
																											  "rotation": 2,
																											  "height": 15,
																											  "width": 13,
																											  "type": "image"
																											  }
																											  };

																											  req.send(JSON.stringify(body));
																											  assert.equal(200, req.status);
																											  
																											  db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_prova'}, function(err, doc){
																																												  if(err) return done(err);
																																												  assert.equal(3, doc.proper.images[0].id);
																																												  done();
																																												  });
																											  });
										  });
				});

			it("PutElement", function(done){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  var id_presentation = doc._id;
																											  
																											  var req = new XMLHttpRequest();
																											  req.open('POST', host+'/private/api/presentations/'+id_presentation+'/element', false);
																											  req.setRequestHeader("Authorization", token);
																											  req.setRequestHeader("Content-Type", 'Application/json');
																											  var body = { "element": {
																											  "id": 3,
																											  "xIndex": 10,
																											  "yIndex": 20,
																											  "rotation": 2,
																											  "height": 15,
																											  "width": 13,
																											  "type": "image"
																											  }
																											  };
																											  req.send(JSON.stringify(body));
																											  var jsonResponse = JSON.parse(req.responseText);
																											  assert.equal(true, jsonResponse.success);
																											  
																											  var req = new XMLHttpRequest();
																											  req.open('PUT', host+'/private/api/presentations/'+id_presentation+'/element', false);
																											  req.setRequestHeader("Authorization", token);
																											  req.setRequestHeader("Content-Type", 'Application/json');
																											  var body = { "element": {
																											  "id": 3,
																											  "xIndex": 1000,
																											  "yIndex": 2000,
																											  "rotation": 2,
																											  "height": 15,
																											  "width": 13,
																											  "type": "image"
																											  }
																											  };
																											  req.send(JSON.stringify(body));

																											  assert.equal(200, req.status);
																											  var jsonResponse = JSON.parse(req.responseText);
																											  assert.equal(true, jsonResponse.success);
																											  
																											  var req = new XMLHttpRequest();
																											  req.open('GET', host+'/private/api/presentations/'+id_presentation, false);
																											  req.setRequestHeader("Authorization", token);
																											  req.send();
																											  var jsonResponse = JSON.parse(req.responseText);
																											  
																											  assert.equal(1000, jsonResponse.message.proper.images[0].xIndex);
																											  done();
																											  });
										  });
				});

			it("DeleteElement", function(done){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.name': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  var id_presentation = doc._id;
																											  
																											  var req = new XMLHttpRequest();
																											  req.open('POST', host+'/private/api/presentations/'+id_presentation+'/element', false);
																											  req.setRequestHeader("Authorization", token);
																											  req.setRequestHeader("Content-Type", 'Application/json');
																											  var body = { "element": {
																											  "id": 3,
																											  "xIndex": 10,
																											  "yIndex": 20,
																											  "rotation": 2,
																											  "height": 15,
																											  "width": 13,
																											  "type": "image"
																											  }
																											  };
																											  req.send(JSON.stringify(body));
																											  var jsonResponse = JSON.parse(req.responseText);
																											  assert.equal(true, jsonResponse.success);
																											  
																											  var req = new XMLHttpRequest();
																											  req.open('DELETE', host+'/private/api/presentations/'+id_presentation+'/delete/image/3', false);
																											  req.setRequestHeader("Authorization", token);
																											  req.send()
																											  assert.equal(200, req.status);
																											  
																											  var req = new XMLHttpRequest();
																											  req.open('GET', host+'/private/api/presentations/'+id_presentation, false);
																											  req.setRequestHeader("Authorization", token);
																											  req.send();
																											  var jsonResponse = JSON.parse(req.responseText);
																											  
																											  assert.equal(0, jsonResponse.message.proper.images.length);
																											  done();
																											  });
										  });
				});
			
});



