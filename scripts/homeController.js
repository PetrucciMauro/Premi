'use strict';

var premiHomeController = angular.module('premiHomeController', ['premiService'])

premiHomeController.controller('HomeController',['$scope', 'Main', 'toPages', 'Utils', '$window','SharedData', '$location',
	function($scope, Main, toPages, Utils, $window, SharedData, $location) {
		if(Utils.isUndefined(Main.getToken()))//check che sia autenticato
			toPages.loginpage();
		else
		{   //nel caso l'utente sia loggato instanzia queste variabili.
		var mongo = MongoRelation(Utils.hostname(), Main.login());
		$scope.mongo = mongo;
		var allSS = mongo.getPresentationsMeta();
		$scope.allSS =  allSS;
		}
		$scope.display_limit = 50;

		//istanziazione di mongoRelation

		var update = function(){
			allSS = mongo.getPresentationsMeta();
		};
		
		//Metodi per il reindirizzamento
		$scope.goEdit = function(slideId){
			toPages.editpage(slideId);
		};
		$scope.goExecute = function(slideId){
			SharedData.forEditManuel(myJson);
			$location.path('private/execution');
			/*
			toPages.executionpage(slideId);
			*/
		};
		$scope.goProfile = function(){
			toPages.profilepage();
		};
		var myJson = {
		    "meta":
		            {
		                "id": 1,
		                "data_ultima_modifica": 2015,
		                "titolo": "presentazione di prova"
		            },
		    "proper": {
		        "paths": {
		            "main": [2,12],
		            "choices": [{
		                    "pathId": 0,
		                    "choicePath": [80]
		                }, {
		                    "pathId": 1,
		                    "choicePath": [11]
		                }]
		        },
		        "texts": [
		            {
		                "id": 1,
		                "left": 10,
		                "top": 20,
						"scalable": 20,
		                "rotation": 2,
		                "height": 15,
		                "width": 13,
		                "zIndex": 3,
		                "waste": 2,
		                "content": "babba",
		                "font": "arial",
		                "color": "red"
		            }],
		        "frames": [
		        	{
		                "id": 2,
		                "left": 0,
		                "top": 0,
		                "rotation": 180,
		                "height": 200,
		                "width": 300,
		                "zIndex": 1,
		                "bookmark": 1,
		                "backgroundimage": "",
		                "backgroundcolor": "rgba(2,23,244,1)"
		            },
		            {
		                "id": 11,
		                "left": 100,
		                "top": 20,
		                "rotation": 2,
		                "height": 500,
		                "width": 100,
		                "zIndex": 2,
		                "bookmark": 1,
		                "backgroundimage": "",
		                "backgroundcolor": "rgba(40,50,200,2)"
		            }],
		        "images": [{
		                "id": 3,
		                "left": 10,
		                "top": 20,
		                "rotation": 2,
		                "height": 15,
		                "width": 13,
		                "zIndex": 10,
		                "waste": 1,
		                "url": "files/legolas/image/background.jpg"
		            }],
		        "audios": [{
		                "id": 4,
		                "left": 10,
		                "top": 20,
		                "rotation": 2,
		                "height": 15,
		                "width": 13,
		                "zIndex": 1,
		            }],
		        "videos": [{
		                "id": 5,
		                "left": 10,
		                "top": 20,
		                "rotation": 2,
		                "height": 15,
		                "width": 13,
		                "zIndex": 1,
		                "waste": 3
		            }],
		        "background": {
						"id": 0,
		                "left": 0,
		                "top": 0,
		                "rotation": 0,
		                "height": 0,
		                "width": 0,
						"url": "files/legolas/image/background.jpg",
						"color": "rgba(31,23,22,1)"
		        }
		    }
		};
		//Metodi propri della home
		$scope.getSS = function() {
			return allSS;
		};
		$scope.deleteSlideShow = function(slideId) {
			var confirm = $window.confirm('Sicuro di voler eliminare la presentazione?');

			if(!confirm)
				return;

			if(!mongo.deletePresentation(slideId))
				throw new Error(mongo.getMessage());

			update();
		};
		$scope.renameSlideShow = function(nameSS) {
			var rename = $window.prompt('Nome:', undefined);

			if(rename === null)
				return;

			if(Utils.isUndefined(rename))
				throw new Error("E' necessario specificare un nome per poter rinominare la presentazione");

			if(!mongo.renamePresentation(nameSS,rename))
				throw new Error(mongo.getMessage());

			update();
		};
		$scope.createSlideShow = function() {
			if(Utils.isUndefined($scope.slideshow.name))
				throw new Error("E' necessario specificare un nome per la presentazione");

			if(!mongo.newPresentation($scope.slideshow.name))
				throw new Error(mongo.getMessage());

			$scope.newSS = !$scope.newSS;
			update();
		};

		$scope.salvaManifest = function(slideId){
			//CHI RICHIAMO?
		}
		
}])