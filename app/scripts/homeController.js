'use strict';

var premiHomeController = angular.module('premiHomeController', ['premiService'])

premiHomeController.controller('HomeController',['$scope','$localStorage', 'Main', 'toPages', 'Utilities',
	function($scope, $localStorage,  Main, toPages, Utilities) {
		$scope.goEdit = function(slideId){
			toPages.editpage(slideId);
		}

		$scope.goExecute = function(slideId){
			toPages.executionpage(slideId);
		}

		$scope.goProfile = function(){
			toPages.profilepage();
		}

		$scope.allSS = function() {
			var getSS = MongoRelation(Utilities.hostname(),$localStorage.token);

			getSS.getPresentationsMeta();

			console.log(getSS);
		}
		$scope.deleteSlideShow = function(slideId) {
			//$scope.delete CHIAMARE LA DELETE SLIDESHOW DEL MODEL
			//$scope.delete CHIAMARE LA DELETE SLIDESHOW DELLA VIEW
		}
		$scope.renameSlideShow = function(slideId) {
			//$scope.delete CHIAMARE LA DELETE SLIDESHOW DEL MODEL
			//$scope.delete CHIAMARE LA DELETE SLIDESHOW DELLA VIEW
		}
		$scope.createSlideShow = function() {
			var newSS = MongoRelation(Utilities.hostname(),$localStorage.token);

			newSS.newPresentation("Prova");

			console.log(newSS);
		}

}])