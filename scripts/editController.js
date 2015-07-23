'use strict';

var premiHomeController = angular.module('premiEditController', ['premiService'])

premiHomeController.controller('EditController',['$scope', 'Main', 'toPages', 'Utils', 'SharedData', '$q', '$mdSidenav', '$mdBottomSheet',
	function($scope, Main, toPages, Utils, SharedData, $q, $mdSidenav, $mdBottomSheet) {
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
		console.log(SharedData.forEdit());

		$scope.toggleList = function() {
			var pending = $mdBottomSheet.hide() || $q.when(true);

			pending.then(function(){
				$mdSidenav('left').toggle();
			});
		}

		$scope.show = function(which, id){
			$scope.sfondo = false;
			$scope.insele = false;
			if(which === 'insele')
				$scope.insele = true;
			if(which === 'sfondo')
				$scope.sfondo = true;
			
			toggleElement(id);
		}

		//Metodi propri dell'edit
		$scope.inserisciFrame = function(){
			inserisciFrame();
		}
		$scope.inserisciTesto = function(){
			inserisciTesto();
		}

}])