'use strict';

var premiHomeController = angular.module('premiHomeController', ['premiService'])

premiHomeController.controller('HomeController',['$scope', '$location', 'Main', 'toPages',
	function($scope, $location,  Main, toPages) {
		$scope.goEdit = function(slideId){
			toPages.editpage(slideId);
		}

		$scope.goExecute = function(slideId){
			toPages.executionpage(slideId);
		}

		$scope.goProfile = function(){
			toPages.profilepage();
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
			//$scope.delete CHIAMARE LA DELETE SLIDESHOW DEL MODEL
			//$scope.delete CHIAMARE LA DELETE SLIDESHOW DELLA VIEW
		}
}])