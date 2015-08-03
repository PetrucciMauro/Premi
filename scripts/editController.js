'use strict';

var premiEditController = angular.module('premiEditController', ['premiService'])

premiEditController.controller('EditController', ['$scope', 'Main', 'toPages', 'Utils', 'SharedData', 'Upload', '$q', '$mdSidenav', '$mdBottomSheet', '$location',
	function($scope, Main, toPages, Utils, SharedData, Upload, $q, $mdSidenav, $mdBottomSheet, $location) {
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
			var style = $("#" + frame.id);

			var spec = {
				id: frame.id,
				xIndex: style.position().left,
				yIndex: style.position().top,
				height: style.outerHeight(),
				width: style.outerWidth(),
				rotation: 0,
				zIndex: style.zIndex()
			};

			var command = concreteFrameInsertCommand(spec); //model
			inv.execute(command);
		}
		$scope.inserisciTesto = function(){
			var text = inserisciTesto(); //view
			var style = $("#" + text.id);

			var spec = {
				id: text.id,
				xIndex: style.position().left,
				yIndex: style.position().top,
				height: style.outerHeight(),
				width: style.outerWidth(),
				rotation: 0,
				//font: style.font COME SI FA A RITORNARE IL FONT?
				//scalable: 
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
				var style = $("#" + img.id);

				var spec = {
					id: img.id,
					xIndex: style.position().left,
					yIndex: style.position().top,
					height: style.outerHeight(),
					width: style.outerWidth(),
					rotation: 0,
					ref: fileurl
				};

				var command = concreteImageInsertCommand(spec); //model
				inv.execute(command);

				console.log(document);
			}
		}
		$scope.inserisciAudio = function(files){
			if(!Upload.isAudio(files))
				throw new Error("Estensione non corretta");

			uploadmedia(files);

			for(var i=0; i<files.length; ++i){
				var fileurl = baseurl + 'audio/' + files[i].name;
				var audio = inserisciAudio(fileurl); //view
				var style = $("#" + audio.id);

				var spec = {
					id: audio.id,
					xIndex: style.position().left,
					yIndex: style.position().top,
					height: style.outerHeight(),
					width: style.outerWidth(),
					rotation: 0,
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
				var style = $("#" + video.id);

				var spec = {
					id: video.id,
					xIndex: style.position().left,
					yIndex: style.position().top,
					height: style.outerHeight(),
					width: style.outerWidth(),
					rotation: 0,
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
			var style = document.getElementById('content').style;
			style.removeProperty('background');

			//QUALI VALORI DARE??

			var spec = {
				color: style.backgroundColor,
				image: style.backgroundImage
			};

			var command = concreteBackgroundInsertCommand(spec);
			inv.execute(command);
		}

		$scope.backcolor = "#ffffff";
		$scope.cambiaColoreSfondo = function(color){
			var style = document.getElementById('content').style;
			var x = $("#content");
			console.log(x);
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

			var style = document.getElementById('content').style;
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

		//VEDERE SE E' POSSIBILE VELOCIZZARE QUESTI DUE:
		//muoviElemento: risponde a mouseup -> si attiva anche se l'elemento non è stato spostato
		$scope.muoviElemento = function(){
			var tipoElement = active().getTipo();
			var idElement = active().getId();
			var style = $("#" + idElement);

			var spec = {
				id: idElement,
				tipo: tipoElement,
				yIndex: style.position().top,
				xIndex: style.position().left
			};

			var command = concreteEditPositionCommand(spec);
			inv.execute(command);
		}
		//ridimensiona: risponde a onresize -> si attiva sempre ad ogni minimo ridimensionamento
		$scope.ridimensionaElemento = function(){
			var tipoElement = active().getTipo();
			var idElement = active().getId();
			var style = $("#" + idElement);

			var spec = {
				id: idElement,
				tipo: tipoElement,
				height: style.outerHeight(),
				width: style.outerWidth()
			};

			var command = concreteEditSizeCommand(spec);
			inv.execute(command);
		}

	    //aggiungi al percorso principale
		$scope.aggiungiMainPath = function () {
			var activeElement = active().getId();
			console.log(activeElement);
		    mainPath().addToMainPath(active().getId(),0);
		}

		$scope.eseguiSS = function(){
			var presentazione = insertEditRemove().getPresentazione();
			console.log(presentazione);
			SharedData.forEditManuel(myJson);
			//toPages.executionpage();
			$location.path('private/execution');
		}

		$scope.config = {};
		$scope.model = {};
		
		//INSERTEDITREMOVE RIMETTERE JSON.PARSE SU CONSTRUCT
		var translateEdit = function(json){
			//MANCANO I PERCORSI!!!!! DA FARE CON GIOVANNI
			var ins = insertEditRemove();
			ins.constructPresentazione(json);

			//RICREO I FRAME
			/*var frames = ins.getFrames();
			for(var i=0; i<frames.length; ++i){
				var frame = frames[i];
				var spec = {
					id: frame.id,
					left: frame.xIndex,
					top: frame.yIndex,
					height: frame.height,
					width: frame.width,
					rotation: frame.rotation,
					backgroundColor: frame.backgroundcolor,
					backgroundImage: frame.backgroundimage
				};
				inserisciFrame(spec);
			}*/

			//RICREO I TESTI
			var texts = ins.getTexts();
			for(var i=0; i< texts.length; ++i){
				var text = texts[i];
				var spec = {
					id: text.id,
					left: text.xIndex,
					top: text.yIndex,
					height: text.height,
					width: text.width,
					rotation: text.rotation,
					content: text.content,
					font: text.font,
					color: text.color
				};
				inserisciTesto(spec);
			}

			//RICREO IL BACKGROUND
			{
				var background = ins.getBackground();

				var style = document.getElementById('fantoccio').style;
				style.backgroundColor = background.color;
				style.backgroundImage = "url(" + background.url + ")";
			}
			//RICREO FILE MEDIA
			//Immagini
			var imgs = ins.getImages();
			for(var i=0; i< imgs.length; ++i){
				var img = imgs[i];
				var spec = {
					id: img.id,
					left: img.xIndex,
					top: img.yIndex,
					height: img.height,
					width: img.width,
					rotation: img.rotation,
					ref: img.url
				};
				inserisciImmagine(undefined, spec);
			}
			//Audio
			var audios = ins.getAudios();
			for(var i=0; i< audios.length; ++i){
				var audio = audios[i];
				var spec = {
					id: audio.id,
					left: audio.xIndex,
					top: audio.yIndex,
					height: audio.height,
					width: audio.width,
					rotation: audio.rotation,
					ref: audio.url
				};
				inserisciAudio(undefined, spec);
			}
			//Video
			var videos = ins.getVideos();
			for(var i=0; i< videos.length; ++i){
				var video = videos[i];
				var spec = {
					id: video.id,
					left: video.xIndex,
					top: video.yIndex,
					height: video.height,
					width: video.width,
					rotation: video.rotation,
					ref: video.url
				};
				inserisciVideo(undefined, spec);
			}
			//SVG
			/*var SVGs = ins.getSVGs();
			for(var i=0; i< SVGs.length; ++i){
				var svg = SVGs[i];
				var spec = {
					id: svg.id,
					left: svg.xIndex,
					top: svg.yIndex,
					height: svg.height,
					width: svg.width,
					rotation: svg.rotation,
					ref: svg.url
				};
				inserisciSVG(undefined, spec);
			}*/

		};
		//translateEdit(SharedData.forEdit());
		var myJson = {
    "meta":
            {
                "id": 1,
                "data_ultima_modifica": 2015,
                "titolo": "presentazione di prova"
            },
    "proper": {
        "paths": {
            "main": [2,12],
            "choices": [{
                    "pathId": 0,
                    "choicePath": [80]
                }, {
                    "pathId": 1,
                    "choicePath": [11]
                }]
        },
        "texts": [
            {
                "id": 1,
                "xIndex": 10,
                "yIndex": 20,
				"scalable": 20,
                "rotation": 2,
                "height": 15,
                "width": 13,
                "content": "babba",
                "font": "arial",
                "color": "red"
            },
            {
                "id": 7,
                "xIndex": 10,
                "yIndex": 20,
                "rotation": 32,
                "height": 1,
                "width": 134,
                "content": "babba2",
                "font": "times",
                "color": "black"
            }],
        "frames": [
        	{
                "id": 2,
                "xIndex": 0,
                "yIndex": 0,
                "rotation": 180,
                "height": 200,
                "width": 300,
                "bookmark": 1,
                "backgroundimage": "prova",
                "backgroundcolor": "rgba(2,23,244,1)"
            },
            {
                "id": 11,
                "xIndex": 100,
                "yIndex": 20,
                "rotation": 2,
                "height": 500,
                "width": 100,
                "bookmark": 1,
                "backgroundimage": "prova",
                "backgroundcolor": "rgba(40,50,200,2)"
            },
            {
                "id": 12,
                "xIndex": 10,
                "yIndex": 60,
                "rotation": 2,
                "height": 150,
                "width": 130,
                "bookmark": 1,
                "backgroundimage": "prova",
                "backgroundcolor": "rgba(2,23,244,1)"
            }],
        "images": [{
                "id": 3,
                "xIndex": 10,
                "yIndex": 20,
                "rotation": 2,
                "height": 15,
                "width": 13,
                "url": "files/legolas/image/background.jpg"
            }],
        "SVGs": [{
                "id": 6,
                "xIndex": 10,
                "yIndex": 20,
                "rotation": 2,
                "height": 15,
                "width": 13,
                "shape": "0,2,3,4",
                "color": "rgba(2,23,244,1)"
            }],
        "audios": [{
                "id": 4,
                "xIndex": 10,
                "yIndex": 20,
                "rotation": 2,
                "height": 15,
                "width": 13
            }],
        "videos": [{
                "id": 5,
                "xIndex": 10,
                "yIndex": 20,
                "rotation": 2,
                "height": 15,
                "width": 13
            }],
        "background": {
				"id": 0,
                "xIndex": 0,
                "yIndex": 0,
                "rotation": 0,
                "height": 0,
                "width": 0,
				"url": "files/legolas/image/background.jpg",
				"color": "rgba(31,23,22,1)"
        }
    }
};
		//translateEdit(myJson);
		/*TRADUTT. PER MANUEL
		TESTO: appendere al json questi valori:
			-top e left che già c'è nel model
			-top e left dell'input ossia id="txt+id"
			-*/
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
          
    