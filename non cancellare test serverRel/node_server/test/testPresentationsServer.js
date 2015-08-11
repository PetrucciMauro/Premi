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
																	  db.collection('presentationsprovaname').remove({}, function(err, doc){
																																	 var dir= __dirname+'/../files/';
																																	 rmdir.sync(dir);
																																	 fs.mkdirSync(dir);
																																	 db.close();
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
										  db.collection('presentations'+'provaname').insert({'meta': {'titolo': 'presentazione_prova'}, 'proper': {} }, function(err, doc){
																											 if(err) return done(err);
																											 assert.notEqual(null, doc);
																											 
																											 var req = new XMLHttpRequest();
																											 req.open('GET', host+'/private/api/presentations', false);
																											 req.setRequestHeader("Authorization", token);
																											 req.send();
																											 var jsonResponse = JSON.parse(req.responseText);
																											 
																											 assert.equal(200, req.status);
																											 assert.equal('presentazione_prova', jsonResponse.message[0].titolo);
																											 db.close();
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
										  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  assert.equal('presentazione_prova', doc.meta.titolo);
																											  db.close();
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
				
				//MongoClient.connect(database, function(err, db) {
				//						  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_prova'}, function(err, doc){
				//																							  if(err) return done(err);
																											  //var id_presentation = doc._id;
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_copia/'+'presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				assert.equal(200, req.status);
				
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_copia'}, function(err, doc){
																											  if(err) return done(err);
																											  assert.notEqual(null, doc);
																											  
																											  req.open('POST', host+'/private/api/presentations/new/presentazione_copia/'+'presentazione_prova', false);
																											  req.setRequestHeader("Authorization", token);
																											  req.send();
																											  assert.equal(200, req.status);
																											  
																											  var cursor = db.collection('presentations'+'provaname').find();
																											  
																											  cursor.toArray(function(err, docs){
																																  var counter = 0;
																																  assert.equal(2, docs.length);
																																  for(var i=0; i<docs.length; i++){
																																  if(docs[i].meta.titolo == "presentazione_copia"){counter++}
																																  }
																																  assert.equal(1, counter);
																																  db.close();
																																  done();
																																  });
																											  });
										  
										  });
				});
										//  });
				//});
			
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
										  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  //var id_presentation = doc._id;

																											  var req = new XMLHttpRequest();
																											  req.open('GET', host+'/private/api/presentations/'+'presentazione_prova', false);
																											  req.setRequestHeader("Authorization", token);
																											  req.send();
																											  var jsonResponse = JSON.parse(req.responseText);
																											  
																											  assert.equal('presentazione_prova', jsonResponse.message.meta.titolo);
																											  db.close();
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
				
				//MongoClient.connect(database, function(err, db) {
				//						  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_prova'}, function(err, doc){
				//																							  if(err) return done(err);
																											 // var id_presentation = doc._id;

				var req = new XMLHttpRequest();
				req.open('DELETE', host+'/private/api/presentations/'+'presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				assert.equal(200, req.status);
																											  
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  assert.equal(null, doc);
																											  db.close();
																											  done();
																											  });
										  });
				});
				//						  });
				//});
			
			
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
										  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  var id_presentation = doc._id;
																											  
																											  var req = new XMLHttpRequest();
																											  req.open('POST', host+'/private/api/presentations/'+'presentazione_prova'+'/rename/presentazione_renamed', false);
																											  req.setRequestHeader("Authorization", token);
																											  req.send();
																											  assert.equal(200, req.status);
																											  
																											  db.collection('presentations'+'provaname').findOne({'_id' : id_presentation}, function(err, doc){
																																												  if(err) return done(err);
																																												  assert.equal('presentazione_renamed',doc.meta.titolo);
																																												  db.close();
																																												  done();
																																												  });
																											  });
										  });
				});
		
			});

describe("Presentation's elements", function(){
		
			it("DeleteElement", function(/*done*/){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				//MongoClient.connect(database, function(err, db) {
				//						  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_prova'}, function(err, doc){
				//																							  if(err) return done(err);
																											  //var id_presentation = doc._id;
																											  
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/'+'presentazione_prova'+'/element', false);
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
				req.open('GET', host+'/private/api/presentations/'+'presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				
				assert.equal(1, jsonResponse.message.proper.images.length);

				
				var req = new XMLHttpRequest();
				req.open('DELETE', host+'/private/api/presentations/'+'presentazione_prova'+'/delete/image/3', false);
				req.setRequestHeader("Authorization", token);
				req.send()
				assert.equal(200, req.status);
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/presentations/'+'presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				
				assert.equal(0, jsonResponse.message.proper.images.length);
				//done();
				});
				//						  });
				//});
			
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

				//MongoClient.connect(database, function(err, db) {
				//						  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_prova'}, function(err, doc){
				//																							  if(err) return done(err);
				//var id_presentation = doc._id;
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/'+'presentazione_prova'+'/element', false);
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
				MongoClient.connect(database, function(err, db) {
										  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_prova'}, function(err, doc){
																											  if(err) return done(err);
																											  assert.equal(3, doc.proper.images[0].id);
																											  db.close();
																											  done();
																											  });
										  });
				});
				//});
			
			it("PutPaths", function(){
				
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				var req = new XMLHttpRequest();
				req.open('PUT', host+'/private/api/presentations/presentazione_prova/paths', false);
				req.setRequestHeader("Authorization", token);
				req.setRequestHeader("Content-Type", 'Application/json');
				var paths_obj = {"element" : {
				"main": [2,12],
				"choices": [{
								"pathId": 0,
								"choicePath": [80],
								"type": "choice" //new!
								}, {
								"pathId": 1,
								"choicePath": [11],
								"type": "choice" //new!
								}]
				}
				};
				req.send(JSON.stringify(paths_obj));
				
				var req = new XMLHttpRequest();
				req.open('GET', host+'/private/api/presentations/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				assert.equal(80, jsonResponse.message.proper.paths.choices[0].choicePath);
				
				});

			it("PutElement", function(/*done*/){
				var req = new XMLHttpRequest();
				register(req);
				
				var req = new XMLHttpRequest();
				authenticate(req);
				var token = req.getResponseHeader("Authorization");
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				//MongoClient.connect(database, function(err, db) {
				//						  db.collection('presentations'+'provaname').findOne({'meta.titolo': 'presentazione_prova'}, function(err, doc){
				//																							  if(err) return done(err);
				//var id_presentation = doc._id;
																											  
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/'+'presentazione_prova'+'/element', false);
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
				req.open('PUT', host+'/private/api/presentations/'+'presentazione_prova'+'/element', false);
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
				req.open('GET', host+'/private/api/presentations/'+'presentazione_prova', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				var jsonResponse = JSON.parse(req.responseText);
				
				assert.equal(1000, jsonResponse.message.proper.images[0].xIndex);
				//done();
				});
			});
//});
			
//});



