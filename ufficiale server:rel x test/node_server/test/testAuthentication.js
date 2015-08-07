var assert = require("assert");
var MongoClient = require('mongodb').MongoClient;
var database = "mongodb://localhost/premi";
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var host = "http://localhost:8081";
var fs = require('fs');
var rmdir = require('rimraf');


describe("authentication", function(){
			

			describe("Register", function(){
						
						beforeEach(function(done) {
								 MongoClient.connect(database, function(err, db) {
															db.collection('users').remove({}, function(err, doc){
																									if(err) return done(err);
																									var dir= __dirname+'/../files/';
																									rmdir.sync(dir);
																									fs.mkdirSync(dir);
																									done();
																									});
															});
								 });
						
						after(function(done) {
								MongoClient.connect(database, function(err, db) {
														  db.collection('users').remove({}, function(err, doc){
																								  if(err) return done(err);
																								  var dir= __dirname+'/../files/';
																								  rmdir.sync(dir);
																								  fs.mkdirSync(dir);
																								  done();
																								  });
														  });
								});

									
						it("registra utente non presente in db", function(done){
							var req = new XMLHttpRequest();
							req.open('POST', host+'/account/register', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"provapass");
							req.send();
							var jsonResponse = JSON.parse(req.responseText);
							
							assert.equal(200, req.status);
							assert.equal(true, jsonResponse.success);
							MongoClient.connect(database, function(err, db) {
													  db.collection('users').findOne({"username" : "provaname"}, function(err, doc){
																								if(err) return done(err);
																								assert.notEqual(null, doc);
																								done();
																								});
													  });
							});
						
						
						it("non registra se già presente", function(done){
							for(var i=0; i<2; i++){
							var req = new XMLHttpRequest();
							req.open('POST', host+'/account/register', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"provapass");
							req.send();
							}
							var jsonResponse = JSON.parse(req.responseText);
							
							assert.equal(400, req.status);
						   assert.equal(false, jsonResponse.success);
							MongoClient.connect(database, function(err, db) {
													  db.collection('users').findOne({"username" : "provaname"}, function(err, doc){
																								if(err) return done(err);
																								assert.notEqual(null, doc);
																								done();
																								});
													  });

							});
						
						});
			
			describe("Authenticate",function(){
						
						beforeEach(function(done) {
									  MongoClient.connect(database, function(err, db) {
																 db.collection('users').remove({}, function(err, doc){
																										 if(err) return done(err);
																										 var dir= __dirname+'/../files/';
																										 rmdir.sync(dir);
																										 fs.mkdirSync(dir);
																										 done();
																										 });
																 });
									  });
						
						after(function(done) {
								MongoClient.connect(database, function(err, db) {
														  db.collection('users').remove({}, function(err, doc){
																								  if(err) return done(err);
																								  var dir= __dirname+'/../files/';
																								  rmdir.sync(dir);
																								  fs.mkdirSync(dir);
																								  done();
																								  });
														  });
								});

						
						it("autentica utente presente",function(){
							var req = new XMLHttpRequest();
							req.open('POST', host+'/account/register', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"provapass");
							req.send();

							var req = new XMLHttpRequest();
							req.open('GET', host+'/account/authenticate', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"provapass");
							req.send();
							var jsonResponse = JSON.parse(req.responseText);
							
							assert.equal(200,req.status);
							assert.equal(true,jsonResponse.success);
							assert.notEqual(null,req.getResponseHeader("Authorization"));
							
							});
						
						it("autentica utente non presente",function(){
							var req = new XMLHttpRequest();
							req.open('GET', host+'/account/authenticate', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"provapass");
							req.send();
							var jsonResponse = JSON.parse(req.responseText);
							
							assert.equal(400,req.status);
							assert.equal(false,jsonResponse.success);
							assert.equal(null,req.getResponseHeader("Authorization"));
							});
						
						it("autentica password errata",function(){
							var req = new XMLHttpRequest();
							req.open('POST', host+'/account/register', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"provapass");
							req.send();
							
							var req = new XMLHttpRequest();
							req.open('GET', host+'/account/authenticate', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"passowrdsbagliata");
							req.send();
							var jsonResponse = JSON.parse(req.responseText);
							
							assert.equal(400,req.status);
							assert.equal(false,jsonResponse.success);
							assert.equal(null,req.getResponseHeader("Authorization"));
							});
						
						});
			
			describe("ChangePassword", function(){
						
						beforeEach(function(done) {
									  MongoClient.connect(database, function(err, db) {
																 db.collection('users').remove({}, function(err, doc){
																										 if(err) return done(err);
																										 var dir= __dirname+'/../files/';
																										 rmdir.sync(dir);
																										 fs.mkdirSync(dir);
																										 done();
																										 });
																 });
									  });
						
						after(function(done) {
								MongoClient.connect(database, function(err, db) {
														  db.collection('users').remove({}, function(err, doc){
																								  if(err) return done(err);
																								  var dir= __dirname+'/../files/';
																								  rmdir.sync(dir);
																								  fs.mkdirSync(dir);
																								  done();
																								  });
														  });
								});
						
						it("utente presente",function(done){
							var req = new XMLHttpRequest();
							req.open('POST', host+'/account/register', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"provapass");
							req.send();

							var req = new XMLHttpRequest();
							req.open('POST', host+'/account/changepassword', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"provapass"+":"+"newpass");
							req.send();
							var jsonResponse = JSON.parse(req.responseText);

							assert.equal(200,req.status);
							assert.equal(true,jsonResponse.success);
							MongoClient.connect(database, function(err, db) {
													  db.collection('users').findOne({"username" : "provaname"}, function(err, doc){
																								if(err) return done(err);
																								assert.equal("newpass", doc.password);
																								done();
																								});
													  });
							});
						
						it("utente non presente",function(done){
							var req = new XMLHttpRequest();
							req.open('POST', host+'/account/changepassword', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"provapass"+":"+"newpass");
							req.send();
							var jsonResponse = JSON.parse(req.responseText);
							
							assert.equal(400,req.status);
							assert.equal(false,jsonResponse.success);
							MongoClient.connect(database, function(err, db) {
													  db.collection('users').findOne({"username" : "provaname"}, function(err, doc){
																								if(err) return done(err);
																								assert.equal(null, doc);
																								done();
																								});
													  });
							});
						
						it("password errata",function(done){
							var req = new XMLHttpRequest();
							req.open('POST', host+'/account/register', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"provapass");
							req.send();
							
							var req = new XMLHttpRequest();
							req.open('POST', host+'/account/changepassword', false);
							req.setRequestHeader("Authorization", "provaname"+":"+"passwordsbagliata"+":"+"newpass");
							req.send();
							var jsonResponse = JSON.parse(req.responseText);
							
							assert.equal(400,req.status);
							assert.equal(false,jsonResponse.success);
							MongoClient.connect(database, function(err, db) {
													  db.collection('users').findOne({"username" : "provaname"}, function(err, doc){
																								if(err) return done(err);
																								assert.equal("provapass", doc.password);
																								done();
																								});
													  });
							});
						
						});
			
			});



