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

		//Menu a comparsa
		var insertElement = function(bool){
			if(bool)
				$scope.insertElement = true;
			else
				$scope.insertElement = false;
		}
		var backgroundManage = function(bool){
			if(bool)
				$scope.backgroundManage = true;
			else
				$scope.backgroundManage = false;
		}
		var slideShowBackgroundManage = function(bool){
			if(bool)
				$scope.slideShowBackgroundManage = true;
			else
				$scope.slideShowBackgroundManage = false;
		}
		var pathsManage = function(bool){
			if(bool)
				$scope.pathsManage = true;
			else
				$scope.pathsManage = false;
		}
		var rotation = function(bool){
			if(bool)
				$scope.rotation = true;
			else
				$scope.rotation = false;
		}
		//per far apparire il div corretto e far sparire quelli eventualmenti aperti
		//which-> variabile per ng-show || id-> id del div su cui applicare il toggleElement
		$scope.show = function(id){
			backgroundManage(false);
			slideShowBackgroundManage(false);
			insertElement(false);
			pathsManage(false);
			rotation(false);

			if(id === 'insertElement')
				insertElement(true);
			else if(id === 'slideShowBackgroundManage')
				slideShowBackgroundManage(true);
			else if(id === 'backgroundManage')
				backgroundManage(true);
			else if(id == 'rotation')
				rotation(true);
			else if(id == 'pathsManage')
				pathsManage(true);
			else
				throw new Error("Elemento non riconosciuto");
			
			toggleElement(id);
		}

		//METODI PROPRI DELL'EDIT
		//Inserimento elementi
		$scope.inserisciFrame = function(){
			inserisciFrame();
			insertElement(false);
		}
		$scope.inserisciTesto = function(){
			inserisciTesto();
			insertElement(false);
		}

		//Gestione sfondo
		$scope.rimuoviSfondo = function(){
			document.getElementById('content').style.removeProperty('background');
		}
		$scope.cambiaColoreSfondo = function(color){
			document.getElementById('content').style.backgroundColor = '#'+color;
		}
		$scope.cambiaColoreSfondoFrame = function(color){
			document.getElementById('content').style.backgroundColor = '#'+color;
		}

		//Gestione media
		$scope.mediaControl = function(){
			mediaControl();
		}

		//Zoom
		$scope.zoomOut = function(){
			zoomOut();
		}
		$scope.zoomIn = function(){
			zoomIn();
		}
}])