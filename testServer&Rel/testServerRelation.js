/*
 * Name : Giovanni Venturelli
 * Module : UnitTest
 * Location : testServer&Rel/testServerRelation.js
 *
 */

var assert = require("assert");
var MongoClient = require('mongodb').MongoClient;
var database = "mongodb://localhost/premi";
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var host = "http://localhost:8081";
var fs = require('fs');
var path = require('path');
var rmdir = require('rimraf');

var Registration = require("../Registration").Registration;
var Authentication = require("../Authentication").Authentication;
var MongoRelation = require("../MongoRelation").MongoRelation;
var FileServerRelation = require("../FileServerRelation").FileServerRelation;
var Loader = require("../Loader").Loader;

var config = function(done){
	MongoClient.connect(database, function(err, db) {
							  db.collection('users').remove({}, function(err, doc){
																	  if(err) return done(err);
																	  db.collection('presentationsuser').remove({}, function(err, doc){
																																	 var dir= __dirname+'/../../files/';
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

describe("Presentations", function(done){
			
			it("PresentationMeta", function(){
				var reg = Registration(host);
				reg.register("user","pass");
				
				var auth = Authentication(host);
				auth.authenticate("user","pass");
				
				var token = auth.getToken();
				
				var req = new XMLHttpRequest();
				req.open('POST', host+'/private/api/presentations/new/prova_presentazione', false);
				req.setRequestHeader("Authorization", token);
				req.send();
				
				var mongoRel = MongoRelation(host, auth);
				var metas = mongoRel.getPresentationsMeta();
				
				assert.equal("prova_presentazione", metas[0].titolo);
				
				});
			
			it("NewPresentation", function(){
				var reg = Registration(host);
				reg.register("user","pass");
				
				var auth = Authentication(host);
				auth.authenticate("user","pass");
				
				var mongoRel = MongoRelation(host, auth);
				mongoRel.newPresentation("prova_presentazione");
				
				var metas = mongoRel.getPresentationsMeta();
				assert.equal("prova_presentazione", metas[0].titolo);
				});
			
			it("NewCopyPresentation", function(){
				var reg = Registration(host);
				reg.register("user","pass");
				
				var auth = Authentication(host);
				auth.authenticate("user","pass");
				
				var mongoRel = MongoRelation(host, auth);
				mongoRel.newPresentation("prova_presentazione");

				mongoRel.newCopyPresentation("prova_presentazione","nuova_presentazione");
				
				var metas = mongoRel.getPresentationsMeta();
				assert.equal(2, metas.length);

				});
			
			it("GetPresentation", function(){
				var reg = Registration(host);
				reg.register("user","pass");
				
				var auth = Authentication(host);
				auth.authenticate("user","pass");
				
				var mongoRel = MongoRelation(host, auth);
				mongoRel.newPresentation("prova_presentazione");
				
				var pres = mongoRel.getPresentation("prova_presentazione");
				assert.equal("prova_presentazione", pres.meta.titolo);

				});
			
			it("DeletePresentation", function(){
				var reg = Registration(host);
				reg.register("user","pass");
				
				var auth = Authentication(host);
				auth.authenticate("user","pass");
				
				var mongoRel = MongoRelation(host, auth);
				mongoRel.newPresentation("prova_presentazione");
				
				mongoRel.deletePresentation("prova_presentazione");
				
				var metas = mongoRel.getPresentationsMeta();
				assert.equal(0, metas.length);
				});
			
			it("renamePresentation", function(){
				var reg = Registration(host);
				reg.register("user","pass");
				
				var auth = Authentication(host);
				auth.authenticate("user","pass");
				
				var mongoRel = MongoRelation(host, auth);
				mongoRel.newPresentation("prova_presentazione");
				
				mongoRel.renamePresentation("prova_presentazione","renamed_presentazione");
				
				var metas = mongoRel.getPresentationsMeta();
				assert.equal("renamed_presentazione", metas[0].titolo);
				});
			
			it("NewElement", function(done){
				var reg = Registration(host);
				reg.register("user","pass");
				
				var auth = Authentication(host);
				auth.authenticate("user","pass");
				
				var mongoRel = MongoRelation(host, auth);
				mongoRel.newPresentation("prova_presentazione");
				
				var obj = {
				"id": 3,
				"xIndex": 10,
				"yIndex": 20,
				"rotation": 2,
				"height": 15,
				"width": 13,
				"type": "image"
				};
				
				mongoRel.newElement("prova_presentazione", obj, function(){
										  var pres = mongoRel.getPresentation("prova_presentazione");
										  assert.equal(13, pres.proper.images[0].width);
										  done();
										  });
				});
			
			it("updateElement", function(done){
				var reg = Registration(host);
				reg.register("user","pass");
				
				var auth = Authentication(host);
				auth.authenticate("user","pass");
				
				var mongoRel = MongoRelation(host, auth);
				mongoRel.newPresentation("prova_presentazione");
				
				var obj = {
				"id": 3,
				"xIndex": 10,
				"yIndex": 20,
				"rotation": 2,
				"height": 15,
				"width": 13,
				"type": "image"
				};
				
				mongoRel.newElement("prova_presentazione", obj, function(){
										  var pres = mongoRel.getPresentation("prova_presentazione");
										  assert.equal(13, pres.proper.images[0].width);
										  obj.width = 100;
										  mongoRel.updateElement("prova_presentazione", obj, function(){
																		 var pres = mongoRel.getPresentation("prova_presentazione");
																		 assert.equal(100, pres.proper.images[0].width);
																		 done();
																		 });
										  });
				});
			
			it("deleteElement", function(done){
				var reg = Registration(host);
				reg.register("user","pass");
				
				var auth = Authentication(host);
				auth.authenticate("user","pass");
				
				var mongoRel = MongoRelation(host, auth);
				mongoRel.newPresentation("prova_presentazione");
				
				var obj = {
				"id": 3,
				"xIndex": 10,
				"yIndex": 20,
				"rotation": 2,
				"height": 15,
				"width": 13,
				"type": "image"
				};
				
				mongoRel.newElement("prova_presentazione", obj, function(){
										  mongoRel.deleteElement("prova_presentazione", obj.type, obj.id, function(){
																		 var pres = mongoRel.getPresentation("prova_presentazione");
																		 assert.equal(0, pres.proper.images.length);
																		 done();
																		 });
										  });
				});
			
			it("updatePaths", function(done){
				var reg = Registration(host);
				reg.register("user","pass");
				
				var auth = Authentication(host);
				auth.authenticate("user","pass");
				
				var mongoRel = MongoRelation(host, auth);
				mongoRel.newPresentation("prova_presentazione");
				
				var obj_paths = {
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
				};
			
				mongoRel.updatePaths("prova_presentazione", obj_paths, function(){
											
											var pres = mongoRel.getPresentation("prova_presentazione");
											assert.equal(12, pres.proper.paths.main[1]);
											done();
											});
				
				});
			});






