'use strict';

var premiHomeController = angular.module('premiEditController', ['premiService'])

premiHomeController.controller('EditController',['$scope', 'Main', 'toPages', 'Utils',
	function($scope, Main, toPages, Utils) {
		var token = function(){
			return Main.login().getToken();
		}
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

}])