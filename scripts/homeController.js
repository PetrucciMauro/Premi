'use strict';

var premiHomeController = angular.module('premiHomeController', ['premiService'])

premiHomeController.controller('HomeController',['$scope', 'Main', 'toPages', 'Utils',
	function($scope, Main, toPages, Utils) {
		var token = function(){
			return Main.login().getToken();
		}
		$scope.display_limit = 50;

		var mongo = MongoRelation(Utils.hostname(), token());
		var allSS = mongo.getPresentationsMeta();
		console.log("allSS"+allSS);
		//Metodi per il reindirizzamento
		$scope.goEdit = function(slideId){
			toPages.editpage(slideId);
		}
		$scope.goExecute = function(slideId){
			toPages.executionpage(slideId);
		}
		$scope.goProfile = function(){
			toPages.profilepage();
		}
		
		$scope.getSS = function() {
			return allSS;
		}


		//console.log("allSS"+$scope.allSS);
		$scope.deleteSlideShow = function(slideId) {
			//$scope.delete CHIAMARE LA DELETE SLIDESHOW DEL MODEL
			//$scope.delete CHIAMARE LA DELETE SLIDESHOW DELLA VIEW
		}
		$scope.renameSlideShow = function(slideId) {
			//$scope.delete CHIAMARE LA DELETE SLIDESHOW DEL MODEL
			//$scope.delete CHIAMARE LA DELETE SLIDESHOW DELLA VIEW
		}
		$scope.createSlideShow = function() {
			var newSS = MongoRelation(Utils.hostname(), token());

			newSS.newPresentation("Prova");

			console.log(newSS);
		}

		$scope.getSlideShow = function() {
			var newSS = MongoRelation(Utils.hostname(), token());

			newSS.getPresentation("Prova");

			console.log(newSS);
		}
}])