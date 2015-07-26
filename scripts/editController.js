'use strict';

var premiEditController = angular.module('premiEditController', ['premiService'])

premiEditController.controller('EditController',['$scope', 'Main', 'toPages', 'Utils', 'SharedData', '$q', '$mdSidenav', '$mdBottomSheet',
	function ($scope, Main, toPages, Utils, SharedData, $q, $mdSidenav, $mdBottomSheet, $mdDialog) {
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
			    $("#sortable").slideUp();
			});
		}

		$scope.isOpen = false;
		$scope.demo = {
		    isOpen: false,
		    count: 0,
		    selectedAlignment: 'md-left'
		};

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
		var mainpath = function() {
			return mainPath();
		}
		//Bottom Sheet
		$scope.showPathBottomSheet = function($event) {
			$mdBottomSheet.show({
				templateUrl: 'bottomsheet-percorsi',
				controller: 'BottomSheetController'
			}).then(function() {
				console.log("fatto")
			});
		};

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
		
	    //menu contestuali
		var vm = this;
		this.announceClick = function (index) {
		    $mdDialog.show(
              $mdDialog.alert()
                .title('You clicked!')
                .content('You clicked the menu item at index ' + index)
                .ok('Nice')
            );
		};

		$scope.element = { rotation: 0 };

		$scope.setRotation = function (new_rotation) {
		    console.log("rotazione" + getRotationDegrees($('#' + active().getId())));
		    this.element.rotation = new_rotation;
		}

	    //aggiungi al percorso principale
		$scope.addToMain = function () {
		    mainPath().addToMainPath(active().getId());
		}
	}])



premiEditController.controller('BottomSheetController', ['scope',
	function($scope) {
		$scope.stampa = function(){
			return mainPath().stampaPercorso();
		}
	}])


premiApp.directive('printPath', function ($compile) {
    return {
        template: '<md-button id="percorsoPrincipale" class="menu md-button md-default-theme" ng-click="stampaPercorso()">Percorso Principale</md-button>',
        link: function ($scope, el, attr) {
            $scope.stampaPercorso = function () {
                var element = $('#sortable');
                element.empty();

                for (var i = 0; i < mainPath().getPercorso().length; i++) {
                    element.append($compile('<md-list-item class="ui-state-default" id="sort' + mainPath().getPercorso()[i] + '" onMouseOver="highlight(' + mainPath().getPercorso()[i] + ')"  onMouseOut="highlight(' + mainPath().getPercorso()[i] + ')" onClick="flash(' + mainPath().getPercorso()[i] + ')"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item ' + mainPath().getPercorso()[i] + '<md-button class="menu md-button md-default-theme" id="removeFromMainPath" onClick="mainPath().removeFromMainPath(' + mainPath().getPercorso()[i] + ')"><md-tooltip>Rimuovi dal percorso principale</md-tooltip><md-icon md-svg-src="assets/svg/background.svg" class="ng-scope ng-isolate-scope md-default-theme"></md-icon></md-button> </md-list-item>')($scope));
                    var obj = {};
                    obj.id = "sort" + mainPath().getPercorso()[i];
                    obj.association = mainPath().getPercorso()[i];
                    mainPath().pushAssociation(obj);
                }

                element.slideDown("slow");
            }
        }
    };
});

premiApp.directive('printChoichePaths', function ($compile) {
    return {
        template: '<md-button id="percorsiScelta" class="menu md-button md-default-theme" ng-click="stampaElencoPercorsi()">Percorsi Scelta</md-button>',
        link: function ($scope, el, attr) {
            $scope.stampaElencoPercorsi = function () {
                var element = $('#choiceList');
                element.empty();

                for (var i = 0; i < choicePaths().getPercorsi().length; i++) {
                    element.append($compile('<md-list-item class="ui-state-default" id="choice' + choicePaths().getPercorsi()[i].pathId + '" onMouseOver="highlightPath(' + i + ')"  onMouseOut="highlightPath(' + choicePaths().getPercorsi()[i].pathId + ')" ><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item ' + choicePaths().getPercorsi()[i].pathId + '<md-button class="menu md-button md-default-theme" class="deleteChoicePath" onClick="coicePaths().deleteChoicePath(' + i + ')"><md-tooltip>Elimina percorso scelta</md-tooltip><md-icon md-svg-src="assets/svg/background.svg" class="ng-scope ng-isolate-scope md-default-theme"></md-icon></md-button> </md-list-item>')($scope));
                }

                element.slideDown("slow");
            }
        }
    };
});


          
    