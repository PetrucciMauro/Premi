'use strict';

var premiEditController = angular.module('premiEditController', ['premiService'])

premiEditController.controller('EditController', ['$scope', 'Main', 'toPages', 'Utils', 'SharedData', 'Upload', '$q', '$mdSidenav', '$mdBottomSheet',
	function($scope, Main, toPages, Utils, SharedData, Upload, $q, $mdSidenav, $mdBottomSheet) {
		if(Utils.isUndefined(Main.getToken()))//check che sia autenticato
			toPages.loginpage();
		//Metodi per il reindirizzamento
		$scope.goEdit = function(slideId){
			toPages.editpage(slideId);
		}
		$scope.goExecute = function(slideId){
			toPages.executionpage(slideId);
		}

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
			pathsManage(false);
			rotation(false);

			if(id === 'slideShowBackgroundManage')
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

		var inv = invoker();
		var mongo = MongoRelation(Utils.hostname(), Main.login());

		//Inserimento elementi
		$scope.inserisciFrame = function(){
			var frame = inserisciFrame(); //view
			var style = window.getComputedStyle(frame, null);

			var spec = {
				id: frame.id,
				xIndex: style.x,
				yIndex: style.y,
				height: style.height,
				width: style.width,
				rotation: 0
			};

			var command = concreteFrameInsertCommand(spec); //model
			inv.execute(command);
		}
		$scope.inserisciTesto = function(){
			var text = inserisciTesto(); //view
			var style = window.getComputedStyle(text, null);

			var spec = {
				id: text.id,
				xIndex: style.x,
				yIndex: style.y,
				height: style.height,
				width: style.width,
				font: style.font
			};

			var command = concreteTextInsertCommand(spec);  //model
			inv.execute(command);
			console.log(insertEditRemove().getPresentazione());
		}


		var uploadmedia = function(files){
			Upload.uploadmedia(files, function() {
            	console.log("vai così");
            } , function(res) {
            	throw new Error(res.message);
            });
		}
		//url dove sono salvati i file dell'utente corrente
		var baseurl = 'files/' + Main.getUser().user + '/';

		$scope.inserisciImmagine = function(files){
			if(!Upload.isImage(files))
				throw new Error("Estensione non corretta");

			uploadmedia(files);

			for(var i=0; i<files.length; ++i){
				var fileurl = baseurl + 'image/' + 'background.jpg';
				var img = inserisciImmagine(fileurl); //view
				var style = window.getComputedStyle(text, null);

				var spec = {
					id: img.id,
					xIndex: style.x,
					yIndex: style.y,
					height: style.height,
					width: style.width,
					ref: fileurl
				};

				var command = concreteImageInsertCommand(spec); //model
				inv.execute(command);
			}
		}
		$scope.inserisciAudio = function(files){
			if(!Upload.isAudio(files))
				throw new Error("Estensione non corretta");

			uploadmedia(files);

			for(var i=0; i<files.length; ++i){
				var fileurl = baseurl + 'audio/' + files[i].name;
				var audio = inserisciAudio(fileurl); //view
				var style = window.getComputedStyle(text, null);

				var spec = {
					id: img.id,
					xIndex: style.x,
					yIndex: style.y,
					height: style.height,
					width: style.width,
					ref: fileurl
				};

				var command = concreteAudioInsertCommand(spec); //model
				inv.execute(command);
			}
		}
		$scope.inserisciVideo = function(files){
			if(!Upload.isVideo(files))
				throw new Error("Estensione non corretta");

			uploadmedia(files);

			for(var i=0; i<files.length; ++i){
				var fileurl = baseurl + 'video/' + files[i].name;
				var video = inserisciVideo(fileurl); //view
				var style = window.getComputedStyle(text, null);

				var spec = {
					id: img.id,
					xIndex: style.x,
					yIndex: style.y,
					height: style.height,
					width: style.width,
					ref: fileurl
				};

				var command = concreteVideoInsertCommand(spec); //model
				inv.execute(command);
			}
			
		}

		//rimozione
		$scope.rimuoviElemento = function(){
			var id = active().getId();
			var tipoElement = active().getTipo();

			var command = {};
			if(tipoElement === 'frame')
				command = concreteFrameRemoveCommand(id);
			else if(tipoElement === 'image')
				command = concreteImageRemoveCommand(id);
			else if(tipoElement === 'audio')
				command = concreteAudioRemoveCommand(id);
			else if(tipoElement === 'video')
				command = concreteVideoRemoveCommand(id);
			else if(tipoElement === 'text')
				command = concreteTextRemoveCommand(id);
			else
				throw new Error("Elemento da eliminare non riconosciuto");

			elimina(id); //della view

			inv.execute(command);  //del model
		}

		//Gestione sfondo Presentazione
		$scope.rimuoviSfondo = function(){
			var style = document.getElementById('fantoccio').style;
			style.removeProperty('background');

			var spec = {
				color: style.backgroundColor,
				image: style.backgroundImage
			};

			var command = concreteBackgroundInsertCommand(spec);
			inv.execute(command);
		}

		$scope.backcolor = "#ffffff";
		$scope.cambiaColoreSfondo = function(color){
			var style = document.getElementById('fantoccio').style;
			style.backgroundColor = color;

			var spec = {
				color: style.backgroundColor,
				image: style.backgroundImage
			};
			
			var sfondo = concreteBackgroundInsertCommand(spec);
			inv.execute(sfondo);
		}
		$scope.cambiaImmagineSfondo = function(files){
			if(!Upload.isImage(files))
				throw new Error("Estensione non corretta");

			uploadmedia(files);

			var fileurl = baseurl + 'image/' + files[0].name;

			var style = document.getElementById('fantoccio').style;
			style.backgroundImage = "url(" + fileurl + ")";

			var spec = {
				color: style.backgroundColor,
				image: style.backgroundImage
			};

			var command = concreteBackgroundInsertCommand(spec); //model
			inv.execute(command);
		}

		//Gestione sfondo frame
		$scope.cambiaColoreSfondoFrame = function(color){
			var activeFrame = active().getId();
			
			var style = document.getElementById(activeFrame).style;
			style.backgroundColor = color;

			var spec = {
				id: activeFrame,
				color: style.backgroundColor,
				ref: style.backgroundImage
			};

			var command = concreteEditBackgroundCommand(spec);
			inv.execute(command);
		}
		$scope.cambiaImmagineSfondoFrame = function(files){
			if(!Upload.isImage(files))
				throw new Error("Estensione non corretta");

			uploadmedia(files);

			var fileurl = baseurl + 'image/' + files[0].name;
			var activeFrame = active().getId();

			var style = document.getElementById(activeFrame).style;
			style.backgroundImage = "url(" + fileurl + ")";

			var spec = {
				id: activeFrame,
				color: style.backgroundColor,
				ref: style.backgroundImage
			};

			var command = concreteEditBackgroundCommand(spec);
			inv.execute(command);
			console.log(insertEditRemove().getPresentazione());
		}
		$scope.rimuoviSfondoFrame = function(){
			var activeFrame = active().getId();
			
			var style = document.getElementById(activeFrame).style;
			style.removeProperty('background');

			var spec = {
				id: activeFrame,
				color: style.backgroundColor,
				ref: style.backgroundImage
			};

			var command = concreteEditBackgroundCommand(spec);
			inv.execute(command);
		}

		//Gestione media
		$scope.mediaControl = function(){
			mediaControl();
		}
		
	    //menu contestuali
		/*var vm = this; WHAT IS THIS??
		this.announceClick = function (index) {
		    $mdDialog.show(
              $mdDialog.alert()
                .title('You clicked!')
                .content('You clicked the menu item at index ' + index)
                .ok('Nice')
            );
		};*/
		$scope.ruotaElemento = function(value){
			var activeElement = active().getId();
			var tipoElement = active().getTipo();

			if(Utils.isUndefined(activeElement))
				return;

			rotate(activeElement, value);

			var spec = {
				id: activeElement,
				tipo: tipoElement,
				rotation: value
			}

			var command = concreteEditRotationCommand(spec);
			inv.execute(command);
			console.log(insertEditRemove().getPresentazione());
		}
/*
		var thisElement = function(){
			return active().getId();
		}

		$scope.$watch(function(){
				var div = document.getElementById(active().getId());
				if(div)
					return div.style;
				return {};
			},function(newValue, oldValue){
				console.log("mi sto muovendo?");
				console.log(newValue);
				console.log(oldValue);
		},true)

	    //aggiungi al percorso principale
		$scope.addToMain = function () {
		    mainPath().addToMainPath(active().getId());
		}*/

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
/*
premiApp.directive('elementPosition', function($window) {
  return {
    link: function(scope, element) {
    	console.log(element);
      $window.addEventListener('drag', function() {
          console.log("ciao");
      }, false);
    },
  };
 });*/
          
    