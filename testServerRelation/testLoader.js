/*
 * Name : Giovanni Venturelli
 * Module : UnitTest
 * Location : testServer&Rel/testLoader.js
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



describe("Loader", function(done){
 
 it("update", function(done){
 
 var reg = Registration(host);
 reg.register("user","pass");
 
 var auth = Authentication(host);
 auth.authenticate("user","pass");
 
 var mongoRel = MongoRelation(host, auth);
 
 var fakeShowElement = function(){
 var that = {};
 var new_obj = {
 "id": 4,
 "xIndex": 1000,
 "yIndex": 20,
 "rotation": 0,
 "height": 155,
 "width": 131,
 "type": "image"
 };
	 that.getElement = function(nothing){new_obj.id=nothing; return new_obj;};
 that.getPresentationName = function(nothing){return "prova_presentazione"};
 return that;
 };
 
 var loader = Loader(mongoRel, fakeShowElement());
 
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
	 var token = auth.getToken();
	 var req = new XMLHttpRequest();
	 req.open('POST', host+'/private/api/presentations/prova_presentazione/element', false);
	 req.setRequestHeader("Authorization", token);
	 req.setRequestHeader("Content-Type", "Application/json");
	 req.send(JSON.stringify(obj));
 
	 mongoRel.newElement("prova_presentazione", obj, function(){
								//console.log("ora iniziano le add()");
								loader.addInsert(4);
								loader.addInsert(5);
							
								loader.addDelete("image", 5);
								//console.log("ora la update()");
								loader.update(function(){
												 // console.log("ritornati dalla prima update()");
												  var pres = mongoRel.getPresentation("prova_presentazione");
												  
												  assert.equal(2, pres.proper.images.length);
												  assert.equal(4, pres.proper.images[1].id);
												  
												  loader.addDelete("image", 4);
												  loader.addInsert(4);
												  //console.log("prima seconda update")
												  loader.update(function(){
																	 //console.log("ritorno seconda update");
																	 var pres = mongoRel.getPresentation("prova_presentazione");
																	 
																	 assert.equal(2, pres.proper.images.length);
																	 assert.equal(4, pres.proper.images[1].id);
																	 assert.equal(3, pres.proper.images[0].id);
																	 //assert.equal(2, pres.proper.images[0].rotation);
																	 
																	 loader.addUpdate(3);
																	 //console.log("prima terza update");
																	 loader.update(function(){
																						//console.log("ritorno terza update");
																						var pres = mongoRel.getPresentation("prova_presentazione");
																						
																						assert.equal(2, pres.proper.images.length);
																						assert.equal(0, pres.proper.images[0].rotation);
																	 
																						done();
																						});
																	 });
												  
												  });
								});
	 });
});






