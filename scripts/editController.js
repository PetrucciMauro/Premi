'use strict';

var premiEditController = angular.module('premiEditController', ['premiService'])

premiEditController.controller('EditController', ['$scope', 'Main', 'toPages', 'Utils', 'SharedData', 'Upload', '$q', '$mdSidenav', '$mdBottomSheet', '$location', '$interval',
	function($scope, Main, toPages, Utils, SharedData, Upload, $q, $mdSidenav, $mdBottomSheet, $location, $interval) {
	    if(Utils.isUndefined(Main.getToken()))//check che sia autenticato
	        toPages.loginpage();
	    else
	    {
	        var inv = invoker();
	        var mongo = MongoRelation(Utils.hostname(), Main.login());
	        var loader = Loader(mongo, insertEditRemove());
	    }
	    //Metodi per il reindirizzamento
	    $scope.goExecute = function(){
	        /*var json = {"_id":"55c38501d815bccd1f27a461","meta":{"titolo":"Prova"},"proper":{"paths":{"main":[],"choices":[]},"texts":[{"id":"2","xIndex":413,"yIndex":78,"rotation":0,"zIndex":1,"waste": 413,"size": 10, "height":218,"width":153,"content":"balfdjsalkfjsakfjsdkafjl.\nCome stai?? io vorrei andarmene.... perché sono stanco.... voglio moriiiiire","font":"Roboto, sans-serif","color":"rgb(31, 121, 131)","type":"text"}],"frames":[{"id":"1","yIndex":56.6218109130859,"xIndex":73.6218109130859,"rotation":332,"zIndex":0,"height":348,"width":348,"rotation": 50,"bookmark":0,"image":"","color":"rgb(133, 59, 59)","type":"frame"}],"images":[],"SVGs":[],"audios":[],"videos":[],"background":{"width": l, "height": h, "image": "", "color": ""}}};
			
			SharedData.forEditManuel(json);
			$location.path('private/execution');*/
	        var reindirizza = function(){
	            toPages.executionpage();
	        }
	        //loader.update(reindirizza);
	        reindirizza();
		
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

	    $scope.allFonts = (
			//serif
			'\'Times New Roman\', Times, serif' + ';' +
			'Georgia, serif' + ';' +
			'\'Palatino Linotype\', \'Book Antiqua\', Palatino, serif' + ';' +
			//sans-serif
			'Verdana, Geneva, sans-serif' + ';' +
			'Arial, Helvetica, sans-serif' + ';' +
			'\'Arial Black\', Gadget, sans-serif' + ';' +
			'\'Lucida Sans Unicode\', \'Lucida Grande\', sans-serif' + ';' +
			'Tahoma, Geneva, sans-serif' + ';' +
			'\'Comic Sans MS\', cursive, sans-serif' + ';' +
			'Impact, Charcoal, sans-serif' + ';' +
			'\'Trebuchet MS\', Helvetica, sans-serif' + ';' +
			//monospace
			'\'Courier New\', Courier, monospace' + ';' +
			'\'Lucida Console\', Monaco, monospace'

			)
			.split(';').map(function(font){
			    var descr = font.split(',')[0];
			    if(descr.indexOf("'") != -1)
			        descr = descr.split("'")[1];
			    return {value: font, descr: descr};});
		
	    $scope.setSelectedFont = function(font){
	        if(Utils.isUndefined(active().getId()))
	            return false;

	        var selectedFont = $("#txt" + active().getId()).css("font-family");

	        if(font == selectedFont)
	            return true;

	        return false;
	    }

	    //Menu a comparsa
	    var backgroundManage = function(bool){
	        $scope.backgroundManage = bool;
	    }
	    var slideShowBackgroundManage = function(bool){
	        $scope.slideShowBackgroundManage = bool;
	    }
	    var pathsManage = function(bool){
	        $scope.pathsManage = bool;
	    }
	    var rotation = function(bool){
	        $scope.rotation = bool;
	    }
	    
	    var removeBookmark = function (bool) {
	        $scope.removeBookmark = bool;
	    }
	    //per far apparire il div corretto e far sparire quelli eventualmenti aperti
	    //id-> id del div su cui applicare il toggleElement
	    $scope.show = function(id){
	        backgroundManage(false);
	        slideShowBackgroundManage(false);
	        pathsManage(false);
	        rotation(false);
	        addBookmark(false);

	        if(id === 'slideShowBackgroundManage')
	            slideShowBackgroundManage(true);
	        else if(id === 'backgroundManage')
	            backgroundManage(true);
	        else if(id == 'rotation')
	            rotation(true);
	        else if(id == 'pathsManage')
	            pathsManage(true);
	        else if(id== 'addBookmark')
	            addBookmark(true);
	        else if (id == 'removeBookmark')
	            removeBookmark(true);
	        else
	            throw new Error("Elemento non riconosciuto");
			
	        toggleElement(id);
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
	    var salvato = function(){
	        console.log("Salvato con successo");
	    }
	    var save = function(){
	        loader.update(salvato);
	        console.log("partito il save");
	    }

	    $interval(save, 3);
	    var intervalSave = $interval(save, 3);
	    $scope.$on("$locationChangeStart", function(){
	        save();
	        $interval.cancel(intervalSave);
	        intervalSave = undefined;
	    });

	    $scope.salvaPresentazione = function(){
	        save();
	    }
	    //Inserimento elementi
	    $scope.inserisciFrame = function(spec){
	        var frame = inserisciFrame(spec); //view

	        if(Utils.isUndefined(spec)){//Se spec è definito significa che deve essere solamente aggiornata la view
	            var style = document.getElementById(frame.id).style;
	            var top = Number(style.top.split("px")[0]);
	            var left = Number(style.left.split("px")[0]);
	            var outerHeight = Number(style.outerHeight.split("px")[0]);
	            var outerWidth = Number(style.outerWidth.split("px")[0]);

	            var spec = {
	                id: frame.id,
	                xIndex: left,
	                yIndex: top,
	                height: outerHeight,
	                width: outerWidth,
	                rotation: 0,
	                zIndex: Number(style.zIndex)
	            };

	            var command = concreteFrameInsertCommand(spec); //model
	            inv.execute(command);

	            loader.addInsert(frame.id);
	        }
	    }
	    $scope.inserisciTesto = function(spec){
	        var text = inserisciTesto(spec); //view

	        if(Utils.isUndefined(spec)){//Se spec è definito significa che deve essere solamente aggiornata la view
	            var thistext = $("#txt" + text.id);

	            var style = document.getElementById(text.id).style;
	            var top = Number(style.top.split("px")[0]);
	            var left = Number(style.left.split("px")[0]);
	            var height = Number(style.height.split("px")[0]);
	            var width = Number(style.width.split("px")[0]);

	            var spec = {
	                id: text.id,
	                xIndex: left,
	                yIndex: top,
	                height: height,
	                width: width,
	                waste: left,
	                size: thistext.css("font-size"),
	                rotation: 0,
	                font: thistext.css("font-family"),
	                zIndex: Number(style.zIndex)
	            };
	            var command = concreteTextInsertCommand(spec);  //model
	            inv.execute(command);

	            loader.addInsert(text.id);
	        }
	    }


	    var uploadmedia = function(files, callback){
	        Upload.uploadmedia(files, callback);
	    }

	    $scope.inserisciImmagine = function (files, spec) {
	        if (Utils.isObject(spec)) {
	            inserisciImmagine(spec.ref, spec);
	        }
	        else {
	            if (!Upload.isImage(files))
	                throw new Error("Estensione non corretta");

	            uploadmedia(files, function (file) {
	                var fileurl = Upload.getFileUrl(files[0]);
	                var img = inserisciImmagine(fileurl); //view

	                var style = document.getElementById(img.id).style;
	                var top = Number(style.top.split("px")[0]);
	                var left = Number(style.left.split("px")[0]);

	                var immagine = document.getElementById("img" + img.id).style;
	                var imgheight = Number(immagine.height.split("px")[0]);
	                var imgwidth = Number(immagine.width.split("px")[0]);
	                //var imgouterwidth = Number(immagine.outerWidth.split("px")[0]);

	                var spec = {
	                    id: img.id,
	                    xIndex: left,
	                    yIndex: top,
	                    height: imgheight,
	                    width: imgwidth,
	                    // waste: (imgwidth - imgouterwidth) / 2,
	                    rotation: 0,
	                    ref: fileurl,
	                    zIndex: Number(style.zIndex)
	                };

	                var command = concreteImageInsertCommand(spec); //model
	                inv.execute(command);

	                loader.addInsert(img.id);
	            });
	        }
	    }
	    $scope.inserisciAudio = function(files, spec){
	        if(Utils.isObject(spec)){
	            inserisciAudio(spec.ref, spec);
	        }
	        else {
	            if(!Upload.isAudio(files))
	                throw new Error("Estensione non corretta");

	            uploadmedia(files, function(file){
	                var fileurl = Upload.getFileUrl(file);
	                fileurl.replace(/\s/g, "%");
	                //BISOGNA FARLO PERCHE IL SERVER SOSTITUISCE TUTTI GLI SPAZI CON % MA COSÌ NON VA :o
					
	                var audio = inserisciAudio(fileurl); //view

	                var style = document.getElementById(audio.id).style;
	                var top = Number(style.top.split("px")[0]);
	                var left = Number(style.left.split("px")[0]);
	                var height = Number(style.height.split("px")[0]);
	                var width = Number(style.width.split("px")[0]);

	                var spec = {
	                    id: audio.id,
	                    xIndex: left,
	                    yIndex: top,
	                    height: height,
	                    width: width,
	                    rotation: 0,
	                    ref: fileurl,
	                    zIndex: Number(style.zIndex)
	                };

	                var command = concreteAudioInsertCommand(spec); //model
	                inv.execute(command);

	                loader.addInsert(audio.id);
	            });
	        }
	    }
	    $scope.inserisciVideo = function(files, spec){
	        if(Utils.isObject(spec)){
	            inserisciVideo(spec.ref, spec);
	        }
	        else{
	            if(!Upload.isVideo(files))
	                throw new Error("Estensione non corretta");

	            uploadmedia(files, function(file){
	                var fileurl = Upload.getFileUrl(file);
	                var video = inserisciVideo(fileurl); //view

	                var style = document.getElementById(video.id).style;
	                var top = Number(style.top.split("px")[0]);
	                var left = Number(style.left.split("px")[0]);

	                var thisvideo = document.getElementById("video" + video.id).style;
	                var videoouterheight = Number(thisvideo.outerHeight.split("px")[0]);
	                var videoouterwidth = Number(thisvideo.outerWidth.split("px")[0]);
	                var videowidth = Number(thisvideo.width.split("px")[0]);

	                var spec = {
	                    id: video.id,
	                    xIndex: left,
	                    yIndex: top,
	                    height: videoouterheight,
	                    width: videoouterwidth,
	                    waste: (videowidth - videoouterwidth)/2,
	                    rotation: 0,
	                    ref: fileurl,
	                    zIndex: Number(style.zIndex)
	                };

	                var command = concreteVideoInsertCommand(spec); //model
	                inv.execute(command);
	                loader.addInsert(video.id);
	            });
	        }
	    }

	    //rimozione
	    $scope.rimuoviElemento = function (spec) {
	        console.log(JSON.stringify(spec))
	        if(Utils.isObject(spec))//Se spec è definito significa che deve essere solamente aggiornata la view
	            elimina(spec.id); //della view
	        else{
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

	            loader.addDelete(tipoElement, id);
	        }
	    }

	    //Gestione sfondo Presentazione
	    $scope.updateSfondo = function(spec){
	        var style = document.getElementById('content').style;
	        style.backgroundColor = spec.color;
	        if(Utils.isObject(spec.ref))
	            style.backgroundImage = "url(" + spec.ref + ")";
	        else
	            style.backgroundImage = "";
	    }
	    $scope.rimuoviSfondo = function(){
	        var style = document.getElementById('content').style;
	        style.removeProperty('background');

	        var spec = {
	            id: 0,
	            color: style.backgroundColor,
	            image: style.backgroundImage,
	            width: l,
	            height: h
	        };
			
	        var command = concreteBackgroundInsertCommand(spec);
	        inv.execute(command);

	        loader.addUpdate(0);
	    }

	    $scope.backcolor = "#ffffff";
	    $scope.cambiaColoreSfondo = function(color){
	        var style = document.getElementById('content').style;
	        style.backgroundColor = color;

	        var spec = {
	            id: 0,
	            color: style.backgroundColor,
	            image: style.backgroundImage,
	            width: l,
	            height: h
	        };
			
	        var sfondo = concreteBackgroundInsertCommand(spec);
	        inv.execute(sfondo);
	        console.log(insertEditRemove().getPresentazione());
	        loader.addUpdate(0);
	    }
	    $scope.cambiaImmagineSfondo = function(files){
	        if(!Upload.isImage(files))
	            throw new Error("Estensione non corretta");

	        uploadmedia(files, function(){

	            var fileurl = Upload.getFileUrl(file);

	            var style = document.getElementById('content').style;
	            style.backgroundImage = "url(" + fileurl + ")";

	            var spec = {
	                id: 0,
	                color: style.backgroundColor,
	                image: style.backgroundImage,
	                width: l,
	                height: h
	            };

	            var command = concreteBackgroundInsertCommand(spec); //model
	            inv.execute(command);

	            loader.addUpdate(0);
	        });
	    }

	    //Gestione sfondo frame
	    $scope.updateSfondoFrame = function(spec){
	        var style = document.getElementById(spec.id).style;
	        style.backgroundColor = spec.color;
	        if(Utils.isObject(spec.ref))
	            style.backgroundImage = "url(" + spec.ref + ")";
	        else
	            style.backgroundImage = "";
	    }
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

	        loader.addUpdate(activeFrame);
	    }
	    $scope.cambiaImmagineSfondoFrame = function(files){
	        if(!Upload.isImage(files))
	            throw new Error("Estensione non corretta");

	        uploadmedia(files, function(){

	            var fileurl = Upload.getFileUrl(files[0]);
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

	            loader.addUpdate(activeFrame);
	        });
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

	        loader.addUpdate(activeFrame);
	    }
	    $scope.addBookmark = function () {
	        var obj = {};
	        obj.id = active().getId();
	        var command = concreteEditBookmarkCommand(obj);
	        inv.execute(command);
	        $scope.changeActive();
	    }

	    //Gestione media
	    $scope.mediaControl = function(){
	        mediaControl();
	    }

	    $scope.cambiaColoreTesto = function(color){
	        var activeText = active().getId();
			
	        var style = document.getElementById("txt"+activeText).style;
	        style.color = color;

	        var spec = {
	            id: activeText,
	            tipo: "text",
	            color: style.color
	        };
			
	        var command = concreteEditColorCommand(spec);
	        inv.execute(command);

	        loader.addUpdate(activeText);
	    }
	    $scope.cambiaSizeTesto = function(value){
	        var activeText = active().getId();
			
	        var text = document.getElementById("txt" + activeText).style;
	        text.fontSize = value + "em";

	        console.log($("#txt"+activeText).css("font-family"));

	        var spec = {
	            id: activeText,
	            tipo: "text",
	            fontSize: value,
	            font: text.fontFamily
	        };
			
	        console.log(spec);
	        var command = concreteEditFontCommand(spec);
	        inv.execute(command);

	        loader.addUpdate(activeText);
	    }

	    $scope.cambiaFontTesto = function(font){
	        var activeText = active().getId();

	        if(Utils.isUndefined(activeText) || active().getTipo() != "text")
	            return;

	        var style = document.getElementById("txt"+activeText).style;
			
	        style.fontFamily = font;

	        var spec = {
	            id: activeText,
	            tipo: "text",
	            font: font,
	            fontSize: style.fontSize.split("em")[0]
	        };
			
	        var command = concreteEditFontCommand(spec);
	        inv.execute(command);
 
	        loader.addUpdate(activeText);
	    }

	    $scope.aggiornaTesto = function(textId, textContent){
	        console.log(textContent);
	        var spec = {
	            id: textId,
	            tipo: "text",
	            content: textContent
	        };


	        var command = concreteEditContentCommand(spec);
	        inv.execute(command);

	        loader.addUpdate(textId);
	    }

	    //Gestione media
	    $scope.mediaControl = function(){
	        mediaControl();
	    }

	    $scope.annullaModifica = function(){
	        if(inv.getUndoStack()){
	            var annulla = inv.undo(); //insert edit delete editpath

	            switch(annulla.action){
	                case "insert": 
	                    loader.addInsert(annulla.id);
	                    break;
	                case "edit": 
	                    loader.addUpdate(annulla.id);
	                    break;
	                case "delete": 
	                    loader.addDelete(annulla.type, annulla.id);
	                    break;
	                case "editpath": 
	                    loader.addPaths();
	                    break;
	            }
	        }
	    }
	    $scope.ripristinaModifica = function(){
	        if(inv.getRedoStack()){
	            var annulla = inv.redo(); //insert edit delete editpath

	            switch(annulla.action){
	                case "insert": 
	                    loader.addInsert(annulla.id);
	                    break;
	                case "edit": 
	                    loader.addUpdate(annulla.id);
	                    break;
	                case "delete": 
	                    loader.addDelete(annulla.type, annulla.id);
	                    break;
	                case "editpath": 
	                    loader.addPaths();
	                    break;
	            }
	        }
	    }
		
	    $scope.ruotaElemento = function(value, spec){
	        if(Utils.isObject(spec)){
	            rotate(spec.id, value);
	        }
	        else{
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

	            loader.addUpdate(activeElement);
	        }
	    }

	    $scope.muoviElemento = function(spec){
	        if(Utils.isObject(spec) && !spec.toUpdate){
	            var style = document.getElementById(spec.id).style;
	            style.top = spec.yIndex + "px";
	            style.left = spec.xIndex + "px";
	        }
	        else{
	            var tipoElement;
	            var idElement;
	            if(Utils.isObject(spec)){
	                tipoElement = getTipo(spec.id);
	                idElement = spec.id;
	            }
	            else{
	                tipoElement = active().getTipo();
	                idElement = active().getId();
	            }
	            console.log(idElement);
	            var style = document.getElementById(idElement).style;
	            var top = Number(style.top.split("px")[0]);
	            var left = Number(style.left.split("px")[0]);
				
	            var spec = {
	                id: idElement,
	                tipo: tipoElement,
	                yIndex: top,
	                xIndex: left
	            };

	            var command = concreteEditPositionCommand(spec);
	            inv.execute(command);

	            loader.addUpdate(idElement);
	        }
	    }

	    var getTipo = function(id){
	        var type;
	        var element = $("#" + id);
	        if(element.hasClass("frame"))
	            type="frame";
	        else if(element.hasClass("image"))
	            type="image";
	        else if(element.hasClass("SVG"))
	            type="SVG";
	        else if(element.hasClass("text"))
	            type="text";
	        else if(element.hasClass("audio"))
	            type="audio";
	        else if(element.hasClass("video"))
	            type="video";
			
	        return type;
	    }
	    $scope.ridimensionaElemento = function(spec){
	        if(Utils.isObject(spec)){
	            var style = document.getElementById(spec.id).style;
	            style.height = spec.height + "px";
	            style.width = spec.width + "px";
	        }
	        else{
	            var tipoElement = active().getTipo();
	            var idElement = active().getId();
	            var style = document.getElementById(idElement).style;

	            var spec = {
	                id: idElement,
	                tipo: tipoElement
	            };

	            if(tipoElement === "frame"){//c'erano outerheight e outerwidth ma non li prende
	                spec.height = Number(style.height.split("px")[0]);
	                spec.width = Number(style.width.split("px")[0]);;
	            }
	            else if(tipoElement === "text"){
	                var thistext = document.getElementById("txt" + idElement).style;
	                spec.height = Number(thistext.height.split("px")[0]);
	                spec.width = Number(thistext.width.split("px")[0]);
	                spec.waste = Number(thistext.left.split("px")[0]);
	            }
	            else if(tipoElement === "image"){
	                var immagine = document.getElementById("image" + idElement).style;
	                spec.height = Number(immagine.height.split("px")[0]);
	                spec.width = Number(immagine.width.split("px")[0]);
	                spec.waste = (Number(immagine.width.split("px")[0]) - Number(immagine.outerWidth.split("px")[0]))/2;
	            }
	            else if(tipoElement === "audio"){
	                spec.height = Number(style.height.split("px")[0]);
	                spec.width = Number(style.width.split("px")[0]);
	            }
	            else if(tipoElement === "video"){
	                var thisvideo = document.getElementById("video" + idElement).style;
	                spec.height = Number(thisvideo.outerHeight.split("px")[0]);
	                spec.width = Number(thisvideo.outerWidth.split("px")[0]);
	                spec.waste = (Number(thisvideo.width.split("px")[0]) - Number(thisvideo.outerWidth.split("px")[0]))/2;
	            }

	            console.log(spec);

	            var command = concreteEditSizeCommand(spec);
	            inv.execute(command);

	            loader.addUpdate(idElement);
	        }
	    }

	    //aggiungi al percorso principale
	    $scope.aggiungiMainPath = function (spec) {
	        if(Utils.isObject(spec)){
	            mainPath().addToMainPath(spec.id,spec.pos);
	        }
	        else {
	            var activeElement = active().getId();
	            mainPath().addToMainPath(activeElement,0);

	            var spec = {
	                id: activeElement
	            };
	            var trovato = false;
	            var percorso = mainPath().getPercorso();
	            for(var i=0; i < percorso.length && !trovato; ++i)
	                if(percorso[i] == activeElement){
	                    spec.pos = i;
	                    trovato = true;
	                }

	            var command = concreteAddToMainPathCommand(spec);
	            inv.execute(command);

	            loader.addPaths();
	        }
	    }

	    $scope.rimuoviMainPath = function (id, spec) {
	        if(Utils.isObject(spec)){
	            mainPath().removeFromMainPath(spec);
	        }
	        else{
	            mainPath().removeFromMainPath(id);

	            console.log("qui");
	            var command = concreteRemoveFromMainPathCommand(id);
	            inv.execute(command);
	            console.log("li");
	            loader.addPaths();

	            console.log(insertEditRemove().getPresentazione());
	        }
	    }

	    $scope.portaAvanti = function(){
	        var idElement = active().getId();
	        portaAvanti(idElement);

	        var style = $("#" + idElement);

	        var spec = {
	            zIndex: style.zIndex()
	        };

	        loader.addUpdate(idElement);

	        //MODEL: CHI RICHIAMO?
	    }
	    $scope.portaDietro = function(){
	        var idElement = active().getId();
	        mandaDietro(idElement);

	        var style = $("#" + idElement);

	        var spec = {
	            zIndex: style.zIndex()
	        };
			
	        loader.addUpdate(idElement);
	        //MODEL: CHI RICHIAMO?
	    }

	    $scope.config = {};
	    $scope.model = {};
	    $scope.bookmarks = {buttons : 0};
	    $scope.value = active().getId();
	    $scope.changeActive=function(){
	        console.log("cambio " + active().getId());
	        if (active().getId() && insertEditRemove().getElement(active().getId())) {
	            console.log("attivo " + active().getId());
	            console.log(insertEditRemove().getElement(parseInt(active().getId())));
	            if ($scope.bookmarks.buttons != insertEditRemove().getElement(active().getId()).bookmark)
	                $scope.bookmarks.buttons = insertEditRemove().getElement(active().getId()).bookmark;
	            console.log("bookmark " + $scope.bookmarks.button);
	           /*if ($scope.bookmarks.button == 0) {
	                //document.getElementById("bookmarkButton").innerHTML = ' <md-tooltip>Assegna bookmark</md-tooltip>  <md-icon md-svg-src="assets/svg/bookmark.svg" class="ng-scope ng-isolate-scope md-default-theme"></md-icon>';
	            }
	            else if ($scope.bookmarks.button == 1) { }
	             //   document.getElementById("bookmarkButton").innerHTML = '<md-tooltip>Rimuovi bookmark</md-tooltip>  <md-icon md-svg-src="assets/svg/bookmark_delete.svg" class="ng-scope ng-isolate-scope md-default-theme"></md-icon>';*/
	        }
	    };

		var impostaPrimoSfondo = function(param){
			var spec = {
				height: h,
				width: l
			};

			if(param){
				spec.color = param.color;
				spec.image = param.image;
			}
			
			var sfondo = concreteBackgroundInsertCommand(spec);
			inv.execute(sfondo);

			loader.addUpdate(0);
		}
		
		var translateEdit = function(json){
			//MANCANO I PERCORSI!!!!! DA FARE CON GIOVANNI
			var ins = insertEditRemove();
			ins.constructPresentazione(json);
			console.log(insertEditRemove().getPresentazione());

			//RICREO IL BACKGROUND
			var background = ins.getBackground();
			var prop = 1;

			//vedere come gestire il ridimensionamento degli elementi
			//in base a l e h della view
			if(Utils.isObject(background.width) && Utils.isObject(background.height)){
				var style = document.getElementById('content').style;
				
				if(Utils.isObject(background.color))
					style.backgroundColor = background.color;
				if(Utils.isObject(background.image))
					style.backgroundImage = "url(" + background.image + ")";
		
				if(background.width != l)
					prop = (background.width / l);
			}
			else 
				impostaPrimoSfondo();

			console.log(prop);

			//RICREO I FRAME
			var frames = ins.getFrames();
			for (var i = 0; i < frames.length; ++i) {
				var frame = frames[i];
				var spec = {
					id: frame.id,
					xIndex: frame.xIndex * prop,
					yIndex: frame.yIndex * prop,
					height: frame.height * prop,
					width: frame.width * prop,
					zIndex: frame.zIndex,
					rotation: frame.rotation,
					color: frame.color,
					ref: frame.ref
				};
				inserisciFrame(spec);

				if(prop !== 1){
					ins.removeFrame(spec.id);
					ins.insertFrame(spec);
					loader.addDelete("frame",spec.id);
					loader.addInsert(spec.id);
				}
			}

			//RICREO I TESTI
			var texts = ins.getTexts();
			for (var i = 0; i < texts.length; ++i) {
			    
			    var text = texts[i];
				var spec = {
					id: text.id,
					xIndex: text.xIndex * prop,
					yIndex: text.yIndex * prop,
					height: text.height * prop,
					width: text.width * prop,
					zIndex: text.zIndex,
					waste: text.waste * prop,
					rotation: text.rotation,
					content: text.content,
					font: text.font,
					fontSize: text.fontSize,
					color: text.color
				};
				inserisciTesto(spec);

				if(prop !== 1){
					ins.removeText(spec.id);
					ins.insertText(spec);
					loader.addDelete("text", spec.id);
					loader.addInsert(spec.id);
				}
			}

			//RICREO FILE MEDIA
			//Immagini
			var imgs = ins.getImages();
			for (var i = 0; i < imgs.length; ++i) {
				var img = imgs[i];
				var spec = {
					id: img.id,
					xIndex: img.xIndex * prop,
					yIndex: img.yIndex * prop,
					height: img.height * prop,
					width: img.width * prop,
					zIndex: img.zIndex,
					waste: img.waste * prop,
					rotation: img.rotation,
					ref: img.url
				};
				inserisciImmagine(undefined, spec);

				if(prop !== 1){
					ins.removeImage(spec.id);
					ins.insertImage(spec);
					loader.addDelete("image", spec.id);
					loader.addInsert(spec.id);
				}
			}
			//Audio
			var audios = ins.getAudios();
			for (var i = 0; i < audios.length; ++i) {
				var audio = audios[i];
				var spec = {
					id: audio.id,
					left: audio.xIndex * prop,
					yIndex: audio.yIndex * prop,
					height: audio.height * prop,
					width: audio.width * prop,
					zIndex: audio.zIndex,
					rotation: audio.rotation,
					ref: audio.url
				};
				inserisciAudio(undefined, spec);

				if(prop !== 1){
					ins.removeAudio(spec.id);
					ins.insertAudio(spec);
					loader.addDelete("audio",spec.id);
					loader.addInsert(spec.id);
				}
			}
			//Video
			var videos = ins.getVideos();
			for (var i = 0; i < videos.length; ++i) {
				var video = videos[i];
				var spec = {
					id: video.id,
					left: video.xIndex * prop,
					yIndex: video.yIndex * prop,
					height: video.height * prop,
					width: video.width * prop,
					waste: video.waste * prop,
					zIndex: video.zIndex,
					rotation: video.rotation,
					ref: video.url
				};
				inserisciVideo(undefined, spec);

				if(prop !== 1){
					ins.removeVideo(spec.id);
					ins.insertVideo(spec);
					loader.addDelete("video", spec.id);
					loader.addInsert(spec.id);
				}
			}

			//Main path
			var mainpath = ins.getPaths().main;
			for(var i=0; i< mainpath.length; ++i)
				mainPath().addToMainPath(mainpath[i], i);

			if(prop !== 1)
				loader.update(function(){});
			active().deselect();
		};
		
		if(Utils.isObject(SharedData.getPresentazione())){
			translateEdit(SharedData.getPresentazione());
		}
		else
			impostaPrimoSfondo();

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
                    element.append($compile('<md-list-item class="ui-state-default" id="sort' + mainPath().getPercorso()[i] + '" onMouseOver="highlight(' + mainPath().getPercorso()[i] + ')"  onMouseOut="highlight(' + mainPath().getPercorso()[i] + ')" onClick="flash(' + mainPath().getPercorso()[i] + ')"><span class="ui-icon ui-icon-arrowthick-2-n-s"></span>Item ' + mainPath().getPercorso()[i] + '<md-button class="menu md-button md-default-theme" id="removeFromMainPath" ng-click="rimuoviMainPath(' + mainPath().getPercorso()[i] + ')"><md-tooltip>Rimuovi dal percorso principale</md-tooltip><md-icon md-svg-src="assets/svg/background.svg" class="ng-scope ng-isolate-scope md-default-theme"></md-icon></md-button> </md-list-item>')($scope));
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


premiApp.directive('bookmarkButton', function ($compile) {
    var cont = 0;
    return {      
        restrict: 'E',
        
        replace: true,
        link: function (scope, element, attrs) {
            attrs.$observe('attr', function (val) {
                
                    var child = document.getElementById("bookMarkToolTip");
                    if (child) {
                        child.parentNode.removeChild(child);
                    }
                
                if (val == 0) {
                    element.html($compile('<md-button class="menu md-button md-default-theme" id="bookmarkButton" ng-click="addBookmark()"><md-tooltip id="bookMarkToolTip">Assegna bookmark</md-tooltip>  <md-icon md-svg-src="assets/svg/bookmark.svg" class="ng-scope ng-isolate-scope md-default-theme"></md-icon></md-button>')(scope));
                }
                else if (val == 1) {
                    element.html($compile('<md-button class="menu md-button md-default-theme" id="bookmarkButton" ng-click="addBookmark()"><md-tooltip id="bookMarkToolTip">Rimuovi bookmark</md-tooltip>  <md-icon md-svg-src="assets/svg/bookmark_delete.svg" class="ng-scope ng-isolate-scope md-default-theme"></md-icon></md-button>')(scope));
                }
            }, true);
        }
    }
});