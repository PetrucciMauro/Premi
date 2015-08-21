'use strict';

/*
* Name :  homeController.js
* Module : Controller::homeController
* Location : scripts/homeController.js
*
* History :
* Version       Date        Programmer                  Description
* =================================================================================================
* 0.0.1        01/07/2015   Busetto Matteo            Inizio homeController
* 0.2.0        15/07/2015   Busetto Matteo            Aggiunto lista delle presentazioni
* 0.5.0        20/07/2015   Busetto Matteo            Pulito il codice
* 1.0.0        25/07/2015   Busetto Matteo            Versione finale
* =================================================================================================
*
*/

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
		console.log(allSS);
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
			/*SharedData.forEditManuel(myJson);
			$location.path('private/execution');*/
			
			toPages.executionpage(slideId);
			
		};
		$scope.goProfile = function(){
			toPages.profilepage();
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