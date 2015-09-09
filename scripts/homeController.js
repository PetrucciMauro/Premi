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
var ans = "";
function setAns(val) {
    ans = val;
}

$('document').ready(function () {
    $('body').css("overflow-x", "visible");
});

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
			if(!confirm)
				return;		
		};

		$scope.renameSlideShow = function(nameSS, ev) {
		    $scope.changeTitleDialog(ev, nameSS);
		};
		$scope.createSlideShow = function() {
			if(Utils.isUndefined(ans)||ans==="")
				throw new Error("E' necessario specificare un nome per la presentazione");

			if(!mongo.newPresentation(ans))
				throw new Error(mongo.getMessage());

			$scope.newSS = !$scope.newSS;
			update();
		};
		$scope.salvaManifest = function(title) {
			var json = JSON.parse(JSON.stringify(mongo.getPresentation(title)));
			console.log("salvaManifest");
			// var manifest = manifest();
			manifest.salvaManifest(title,json);
		};

		$scope.deleteManifest = function(title) {
			console.log("deleteManifest");
			manifest.deleteManifest(title);
		};

		$scope.status = '  ';
		$scope.showAlert = function (ev, father, header, body) {
		    // Appending dialog to document.body to cover sidenav in docs app
		    // Modal dialogs should fully cover application
		    // to prevent interaction outside of dialog
		    $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#'+father.id)))
                .clickOutsideToClose(true)
                .title(header)
                .content(body)
                .ariaLabel('Alert Dialog')
                .ok('Ok')
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
		$scope.newName = "";
		$scope.changeTitleDialog = function (ev, nameSS) {
		    $mdDialog.show({
		        controller: DialogController,
		        templateUrl: 'scripts/nameTemplate.html',
		        parent: angular.element(document.body),
		        targetEvent: ev,
		        clickOutsideToClose: true
		    })
            .then(function (answer) {
                allSS = mongo.getPresentationsMeta();
                var found = false;
                for (var i = 0; i < allSS.length && !found; ++i) {
                    if (allSS[i].titolo == ans){
                        found = true;
                    }
                }

                if (found == true) {
                    $scope.showAlert(ev, $('#sectionBody'), "Titolo già presente", "Scegliere un altro titolo per la presentazione.");
                }
                else if (Utils.isUndefined(answer) || answer === "annulla" || ans ==="" || nameSS=== ans) {
                    return;
                }
                else if (!mongo.renamePresentation(nameSS, ans))
                    throw new Error(mongo.getMessage());

                update();
            }, function () {
                return;
            });
		};
		


		$scope.newSlideShow = function (ev) {
		    $mdDialog.show({
		        controller: DialogController,
		        templateUrl: 'scripts/newSlideShowTemplate.html',
		        parent: angular.element(document.body),
		        targetEvent: ev,
		        clickOutsideToClose: true
		    })
            .then(function (answer) {
                allSS = mongo.getPresentationsMeta();
                var found = false;
                if (Utils.isUndefined(answer) || answer === "annulla" || ans === "") {
                    return;
                }
                for (var i = 0; i < allSS.length && !found; ++i) {
                    
                    if (allSS[i].titolo == ans)
                        found = true;
                }

                if (found) {
                    $scope.showAlert(ev, $('#sectionBody'), "Titolo già presente", "Scegliere un altro titolo per la presentazione.");
                }
              
                else $scope.createSlideShow()

                update();
            }, function () {
                return;
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