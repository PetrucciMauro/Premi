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

premiHomeController.controller('HomeController',['$scope', 'Main', 'toPages', 'Utils', '$window','SharedData', '$location', '$mdDialog',
	function ($scope, Main, toPages, Utils, $window, SharedData, $location,  $mdDialog) {
		if(Utils.isUndefined(Main.getToken()))//check che sia autenticato
			toPages.loginpage();
		else
		{   //nel caso l'utente sia loggato instanzia queste variabili.
		var mongo = MongoRelation(Utils.hostname(), Main.login());
		$scope.mongo = mongo;

		var allSS = {};

		var update = function(){
			allSS = mongo.getPresentationsMeta();
			for(var i=0; i<allSS.length; ++i){
				var presentazione = JSON.parse(JSON.stringify(mongo.getPresentation(allSS[i].titolo)));

				var background = presentazione.proper.background;

				allSS[i].color = background.color;
				allSS[i].image = background.image;
			}
		};
		
		update();
		
		$scope.allSS =  allSS;
		}
		$scope.display_limit = 50;

		$scope.setStyleSS = function(slide){
			var spec = {};
			if(Utils.isObject(slide.image)){
				spec = {
					'background-color': slide.color,
					'background-image': "url(" + slide.image + ")"
				}
			} else {
				spec = {
					'background-color': slide.color
				}
			}
			return spec;
		}

		//Metodi per il reindirizzamento
		$scope.goEdit = function(slideId){
			toPages.editpage(slideId);
		};
		$scope.goExecute = function(slideId){			
			toPages.executionpage(slideId);
			
		};
		$scope.goProfile = function(){
			toPages.profilepage();
		};

		//Metodi propri della home
		$scope.getSS = function() {
			return allSS;
		};
		$scope.confirm = false;
		$scope.deleteSlideShow = function(slideId, ev) {
			var confirm = $scope.showConfirmDelete(ev, slideId);
			console.log(confirm);
			if(!confirm)
				return;

			
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

		$scope.status = '  ';
		$scope.showAlert = function (ev) {
		    // Appending dialog to document.body to cover sidenav in docs app
		    // Modal dialogs should fully cover application
		    // to prevent interaction outside of dialog
		    $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('This is an alert title')
                .content('You can specify some description text in here.')
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
                .targetEvent(ev)
            );
		};

		$scope.showConfirmDelete = function (ev, slideId) {
		    // Appending dialog to document.body to cover sidenav in docs app
		    var res = false;
		    var confirm = $mdDialog.confirm()
                  .title('ELIMINARE QUESTA PRESENTAZIONE?')
                  .content('Una volta effettuata questa operazione non sara\' piu\' possibile tornare indietro.')
                  .ariaLabel('Elimina presentazione')
                  .targetEvent(ev)
                  .ok('SI\'')
                  .cancel('NO');
		    $mdDialog.show(confirm).then(function () {
		        if (!mongo.deletePresentation(slideId))
		            throw new Error(mongo.getMessage());
		        update();
		    }, function () {
		        res = false;
		        console.log("res " + res);
		        
		    });
		    
		    return res;
		};
		$scope.showAdvanced = function (ev) {
		    $mdDialog.show({
		        controller: DialogController,
		        templateUrl: 'dialog1.tmpl.html',
		        parent: angular.element(document.body),
		        targetEvent: ev,
		        clickOutsideToClose: true
		    })
            .then(function (answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
		};
		
	}])

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}