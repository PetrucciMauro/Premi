/*
 Name : Giovanni venturelli
 Package : Command
 Location : /scripts/
 Description
	Definizione delle classi di command finalizzati allo sviluppo delle funzionalità di annulla/ripristina

*/

var invokerInstace = {};
var invokerInstanced = false;
var invoker = function () {
    if (!invokerInstanced) {
        var public = {};
        var private = {};
        
        private.undoStack = new Array();
        private.redoStack = new Array();
        public.getUndoMessages = function () {
            var arr=new Array();
            for (var i = 0; i < private.undoStack.length; i++) {
                arr.push(private.undoStack[i].getCommandAction());
            }
            console.log("update undo");
            return arr;
        }

        public.getRedoMessages = function () {
            var arr = new Array();
            for (var i = 0; i < private.redoStack.length; i++) {
                arr.push(private.redoStack[i].getCommandAction());
            }
            
            return arr;
        }

        public.execute = function (com) {
            com.doAction();
            private.undoStack.push(com);
            private.redoStack = [];
            angular.element(content).scope().updateMessages();
            
        };
        public.undo = function () {
            var temp = private.undoStack.pop();
            var obj=temp.undoAction();
            private.redoStack.push(temp);
            angular.element(content).scope().updateMessages();
            return obj;
        };
        public.redo = function () {
            if (private.redoStack.length > 0) {
                var temp = private.redoStack.pop();
                var obj = temp.doAction();
                private.undoStack.push(temp);
                angular.element(content).scope().updateMessages()
                return obj;
            }
        };
        public.getUndoStack = function () {
            var notEmpty = false;
            if (private.undoStack.length > 0) {
                notEmpty = true;
            }
            return notEmpty;
        };
        public.getRedoStack = function () {
            var notEmpty = false;
            if (private.redoStack.length > 0) {
                notEmpty = true;
            }
            return notEmpty;
        };

        invokerInstanced = true;
        invokerInstance = public;
    }
    return invokerInstance;
};

var abstractCommand = function (spec) {
    var public = {};
    var private = {};
    private.id = spec.id;
    private.executed = 0;
    private.enabler = insertEditRemove();
    private.obj = {};
    private.obj.id = spec.id;
    private.obj.type = spec.type || spec.tipo;
    private.commandAction="";
    public.setCommandAction = function (action) {
        private.commandAction = action;
    }
    public.getCommandAction = function () {
        return private.commandAction;
    }
    public.getObj=function(){
        return private.obj;
    }

    public.setId = function (id) {
        private.id = id;
    };

    public.setExecuted = function () {
        private.executed = 1;
    };
    public.getExecuted = function () {
        return private.executed;
    };
    public.getId = function () {
        return private.id;
    };
    public.getPosition = function () {
        var pos = { xIndex: private.xIndex, yIndex: private.yIndex };
        return pos;
    };
    public.getRotation = function () {
        var rot = { rotation: private.rotation };
        return rot;
    };
    public.getEnabler = function () {
        return private.enabler;
    };
    public.getSize = function () {
        var siz = { height: private.height, width: private.width };
        return siz;
    };

    return public;
};

//INSERT
var concreteTextInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("inserimento testo");
    public.doAction = function () {
        public.getEnabler().insertText(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().inserisciTesto(spec);
        }
        var obj = public.getObj();
        obj.action = "insert";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().removeText(public.getId());
        var obj = public.getObj();
        obj.action = "delete";
        angular.element($("#content")).scope().rimuoviElemento(spec.id);
        return obj;
    };
    return public;
};

var concreteImageInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("inserimento immagine");
    public.doAction = function () {
        public.getEnabler().insertImage(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().inserisciImmagine(undefined, spec);
        }
        var obj = public.getObj();
        obj.action = "insert";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().removeImage(public.getId());
        var obj = public.getObj();
        obj.action = "delete";
        angular.element($("#content")).scope().rimuoviElemento(spec.id);
        return obj;
    };
    return public;
};

var concreteFrameInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("inserimento frame");
    public.doAction = function () {
        public.getEnabler().insertFrame(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().inserisciFrame(spec);
        }
        var obj = public.getObj();
        obj.action = "insert";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().removeFrame(public.getId());
        var obj = public.getObj();
        obj.action = "delete";
        angular.element($("#content")).scope().rimuoviElemento(spec.id);
        return obj;
    };
    return public;
};

var concreteSVGInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("inserimento SVG");
    public.doAction = function () {
        public.getEnabler().insertSVG(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
           // angular.element($("#content")).scope().inserisciSVG(spec);
        }
        var obj = public.getObj();
        obj.action = "insert";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().removeSVG(public.getId());
        var obj = public.getObj();
        obj.action = "delete";
       // angular.element($("#content")).scope().rimuoviElemento(spec.id);
        return obj;
    };
    return public;
};

var concreteAudioInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("inserimento audio");
    public.doAction = function () {
        public.getEnabler().insertAudio(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().inserisciAudio(undefined, spec);
        }
        var obj = public.getObj();
        obj.action = "insert";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().removeAudio(public.getId());
        var obj = public.getObj();
        obj.action = "delete";
        angular.element($("#content")).scope().rimuoviElemento(spec.id);
        return obj;
    };
    return public;
};

var concreteVideoInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("inserimento video");
    public.doAction = function () {
        public.getEnabler().insertVideo(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().inserisciVideo(undefined, spec);

        }
        var obj = public.getObj();
        obj.action = "insert";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().removeVideo(public.getId());
        var obj = public.getObj();
        obj.action = "delete";
        angular.element($("#content")).scope().rimuoviElemento(spec.id);
        return obj;
    };
    return public;
};

var concreteBackgroundInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldBackground = {};
    public.setCommandAction("modifica sfondo presentazione");
    public.doAction = function () {
        private.oldBackground = public.getEnabler().insertBackground(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().updateSfondo(spec);
        }
        var obj = public.getObj();
        obj.action = "insert";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().insertBackground(private.oldBackground);
        var obj = public.getObj();
        obj.action = "delete";
        angular.element($("#content")).scope().updateSfondo(private.oldBackground);
        return obj;
    };
    return public;
};

//REMOVE
var concreteTextRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("eliminazione testo");
    public.doAction = function () {
        private.oldText = public.getEnabler().removeText(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().rimuoviElemento(spec);
        }
        var obj = public.getObj();
        obj.action = "delete";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().insertText(private.oldText);
        var obj = public.getObj();
        obj.action = "insert";
        angular.element($("#content")).scope().inserisciTesto(private.oldText);
        return obj;
    };
    return public;
};

var concreteImageRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("eliminazione immagine");
    public.doAction = function () {
        private.oldImage = public.getEnabler().removeImage(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().rimuoviElemento(spec);
        }
        var obj = public.getObj();
        obj.action = "delete";
        return obj;

    };
    public.undoAction = function () {
        public.getEnabler().insertImage(private.oldImage);
        var obj = public.getObj();
        obj.action = "insert";
        return obj;
        angular.element($("#content")).scope().inserisciImmagine(undefined, private.oldImage);
    };
    return public;
};

var concreteFrameRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("eliminazione frame");
    public.doAction = function () {
        private.oldFrame = public.getEnabler().removeFrame(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().rimuoviElemento(spec);
        }
        var obj = public.getObj();
        obj.action = "delete";
        return obj;

    };
    public.undoAction = function () {
        public.getEnabler().insertFrame(private.oldFrame);
        var obj = public.getObj();
        obj.action = "insert";
        angular.element($("#content")).scope().inserisciFrame(private.oldFrame);
        return obj;
    };
    return public;
};

var concreteSVGRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("eliminazione SVG");
    public.doAction = function () {
        private.oldSVG = public.getEnabler().removeSVG(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
           // angular.element($("#content")).scope().rimuoviElemento(spec);
        }
        var obj = public.getObj();
        obj.action = "delete";
        return obj;

    };
    public.undoAction = function () {
        public.getEnabler().insertSVG(private.oldSVG);
        var obj = public.getObj();
        obj.action = "insert";
        //angular.element($("#content")).scope().inserisciSVG(undefined, private.oldSVG);
        return obj;
    };
    return public;
};

var concreteAudioRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("eliminazione audio");
    public.doAction = function () {
        private.oldAudio = public.getEnabler().removeAudio(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().rimuoviElemento(spec);
        }
        var obj = public.getObj();
        obj.action = "delete";
        return obj;

    };
    public.undoAction = function () {
        public.getEnabler().insertAudio(private.oldAudio);
        var obj = public.getObj();
        obj.action = "insert";
        angular.element($("#content")).scope().inserisciAudio(undefined, private.oldAudio);
        return obj;
    };
    return public;
};

var concreteVideoRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("eliminazione video");
    public.doAction = function () {
        private.oldVideo = public.getEnabler().removeVideo(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().rimuoviElemento(spec);
        }
        var obj = public.getObj();
        obj.action = "delete";
        return obj;

    };
    public.undoAction = function () {
        public.getEnabler().insertVideo(private.oldVideo);
        var obj = public.getObj();
        obj.action = "insert";
        angular.element($("#content")).scope().inserisciVideo(undefined, private.oldVideo);
        return obj;
    };
    return public;
};

//EDITING
var concreteEditPositionCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldPosition = {};
    public.setCommandAction("sposta elemento");
    public.doAction = function () {
        private.oldPosition = public.getEnabler().editPosition(spec);
        private.oldPosition.id = spec.id;
        private.oldPosition.tipo = spec.tipo;

        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().muoviElemento(spec);
        }
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().editPosition(private.oldPosition);
        var obj = public.getObj();
        obj.action = "edit";
        angular.element($("#content")).scope().muoviElemento(private.oldPosition);
        return obj;
    };
    return public;
};

var concreteEditRotationCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldRotation = {};
    public.setCommandAction("ruota elemento");
    public.doAction = function () {
        private.oldRotation.rotation = public.getEnabler().editRotation(spec);
        private.oldRotation.id = spec.id;
        private.oldRotation.tipo = spec.tipo;
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().ruotaElemento(spec);
        }
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().editPosition(private.oldRotation);
        var obj = public.getObj();
        obj.action = "edit";
        angular.element($("#content")).scope().ruotaElemento(private.oldRotation);
        return obj;
    };
    return public;
};

var concreteEditSizeCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldSize = {};
    public.setCommandAction("ridimensiona elemento");
    public.doAction = function () {
        private.oldSize = public.getEnabler().editSize(spec);
        private.oldSize.id = spec.id;
        private.oldSize.tipo = spec.tipo;
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().ridimensionaElemento(spec);
        }
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().editSize(private.oldSize);
        var obj = public.getObj();
        obj.action = "edit";
        angular.element($("#content")).scope().ridimensionaElemento(private.oldSize);//PASSARE OLD SIZE
        return obj;
    };
    return public;
};

var concreteEditContentCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldContent = {};
    public.setCommandAction("modifica testo");
    public.doAction = function () {
        private.oldContent.content = public.getEnabler().editContent(spec);
        private.oldContent.id = spec.id;
        private.oldContent.tipo = spec.tipo;
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().aggiornaTesto(undefined, undefined, spec);
        }
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().editContent(private.oldContent);
        var obj = public.getObj();
        obj.action = "edit";
        angular.element($("#content")).scope().aggiornaTesto(undefined, undefined, private.oldContent);
        return obj;
    };
    return public;
};

var concreteEditBackgroundCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldBackground = {};
    public.setCommandAction("modifica sfondo");
    public.doAction = function () {
        private.oldBackground = public.getEnabler().editBackground(spec);
        private.oldBackground.id = spec.id;
        private.oldBackground.tipo = "frames";
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().updateSfondoFrame(spec);
        }
        var obj = public.getObj();
        obj.action = "edit";
        
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().editBackground(private.oldBackground);
        var obj = public.getObj();
        obj.action = "edit";
        angular.element($("#content")).scope().updateSfondoFrame(private.oldBackground);//PASSARE OLD BCKGR
        return obj;
    };
    return public;
};

var concreteEditColorCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};

    private.oldColor = {};
    public.setCommandAction("modifica colore sfondo");
    public.doAction = function () {
        private.oldColor.color = public.getEnabler().editColor(spec);
        private.oldColor.id = spec.id;
        private.oldColor.tipo = spec.tipo;
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().cambiaColoreTesto(undefined, spec);
        }
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().editColor(private.oldColor);
        var obj = public.getObj();
        obj.action = "edit";
        angular.element($("#content")).scope().cambiaColoreTesto(undefined, private.oldColor);
        return obj;
    };
    return public;
};

var concreteEditBookmarkCommand = function (spec) {
    public = abstractCommand(spec);
    public.doAction = function () {
        var bookmark = public.getEnabler().getElement(spec.id).bookmark = (public.getEnabler().getElement(spec.id).bookmark + 1) % 2;
        if (public.getEnabler().getElement(spec.id).bookmark = 1) {
            public.setCommandAction("assegna bookmark");
        }
        else
            public.setCommandAction("rimuovi bookmark");
        if (public.getExecuted() === 0) {
            public.setExecuted(1);        }
        else {
            if(bookmark == 0)
                angular.element($("#content")).scope().RemoveBookmark(spec);
            else
                angular.element($("#content")).scope().AddBookmark(spec);
        }
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
    };
    public.undoAction = function () {
        var bookmark = public.getEnabler().getElement(spec.id).bookmark = (public.getEnabler().getElement(spec.id).bookmark + 1) % 2;
        var obj = public.getObj();
        obj.action = "edit";
        if(bookmark == 0)
            angular.element($("#content")).scope().RemoveBookmark(spec);
        else
            angular.element($("#content")).scope().AddBookmark(spec);
        return obj;
    };
    return public;
}

var concreteEditFontCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldFont = {};
    public.setCommandAction("modifica font");
    public.doAction = function () {
        private.oldFont = public.getEnabler().editFont(spec);
        private.oldFont.id = spec.id;
        private.oldFont.tipo = spec.tipo;
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {

            angular.element($("#content")).scope().updateFont(spec);
        }
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().editFont(private.oldFont);
        var obj = public.getObj();
        obj.action = "edit";
        angular.element($("#content")).scope().updateFont(private.oldFont);
        return obj;
    };
    return public;
};

var concretePortaAvantiCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldZIndex = {};
    public.setCommandAction("porta avanti");
    public.doAction = function () {
        private.oldZIndex.other = spec.other;
        private.oldZIndex.id = spec.id;
        private.oldZIndex.tipo = spec.tipo;
        public.getEnabler().portaAvanti(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().portaAvanti(spec);
        }
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().portaDietro(private.oldZIndex);
        angular.element($("#content")).scope().portaDietro(private.oldZIndex);
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
        
    };
    return public;
};

var concretePortaDietroCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldZIndex = {};
    public.setCommandAction("porta dietro");
    public.doAction = function () {
        private.oldZIndex.other = spec.other;
        private.oldZIndex.id = spec.id;
        private.oldZIndex.tipo = spec.tipo;
        public.getEnabler().portaDietro(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().portaDietro(spec);
        }
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().portaAvanti(private.oldZIndex);
        angular.element($("#content")).scope().portaAvanti(private.oldZIndex);
        var obj = public.getObj();
        obj.action = "edit";
        return obj;
        
    };
    return public;
};



//PERCORSI
var concreteAddToMainPathCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.setCommandAction("aggiungi a percorso principale");
    public.doAction = function () {
        console.log("inserisco nel percorso principale");
        public.getEnabler().addFrameToMainPath(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().aggiungiMainPath(spec);
        }
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().removeFrameFromMainPath(spec.id);
        var obj = public.getObj();
        obj.action = "editPath";
        angular.element($("#content")).scope().rimuoviMainPath(undefined, spec.id);
        return obj;
    };
    return public;
};

var concreteSetMainPathCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    var oldPath = {};
    public.setCommandAction("modifica percorso principale");
    public.doAction = function () {
        console.log("modifico percorso principale");
        oldPath = public.getEnabler().setMainPath(spec.path);
        console.log("oldpath = " + JSON.stringify(oldPath));
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            angular.element($("#content")).scope().setMainPath(spec);
        }
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
    };
    public.undoAction = function () {
        var obj = public.getObj();
        obj.action = "editPath";
        angular.element($("#content")).scope().setMainPath(oldPath);
        return obj;
    };
    return public;
};


var concreteRemoveFromMainPathCommand = function (spec) {
    var public = abstractCommand(spec);
    var oldFrame = {};
    public.setCommandAction("rimuovi da percorso principale");
    public.doAction = function () {
        oldFrame = public.getEnabler().removeFrameFromMainPath(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);

        }
        else {
            angular.element($("#content")).scope().rimuoviMainPath(undefined, spec);
        }

        angular.element(content).scope().updateBookmark(spec.id);
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().addFrameToMainPath(oldFrame);
        var obj = public.getObj();
        obj.action = "editPath";
        angular.element($("#content")).scope().aggiungiMainPath(oldFrame);

        angular.element(content).scope().updateBookmark(oldFrame.id);
        return obj;
    };
    return public;
};

var concreteAddToChoicePathCommand = function (spec) {
    var public = abstractCommand(spec);
    public.setCommandAction("aggiungi a percorso scelta");
    public.doAction = function () {
        public.getEnabler().addFrameToChoicePath(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().removeFrameFromChoicePath(spec);
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
        //controller.update(public.getId());
    };
    return public;
};

var concreteRemoveFromChoicePathCommand = function (spec) {
    var public = abstractCommand(spec);
    var oldFrame = {};
    public.setCommandAction("rimuovi da percorso scelta");
    public.doAction = function () {
        oldFrame = public.getEnabler().removeFrameFromChoicePath(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().addFrameToChoicePath(oldFrame);
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
        //controller.update(public.getId());
    };
    return public;
};

var concreteNewChoicePathCommand = function (spec) {
    var public = abstractCommand(spec);
    var pathId;

    public.setCommandAction("crea percorso scelta");
    public.doAction = function () {
        pathId = public.getEnabler().addChoicePath(spec.id);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().deleteChoicePath(pathId);
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
        //controller.update(public.getId());
    };
    return public;
};

var concreteDeleteChoicePathCommand = function (spec) {
    var public = abstractCommand(spec);
    var oldPath = {};
    public.setCommandAction("elimina percorso scelta");
    public.doAction = function () {
        oldPath = public.getEnabler().deleteChoicePath(spec.pathId);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
    };
    public.undoAction = function () {
        public.getEnabler().addChoicePath(oldPath);
        var obj = public.getObj();
        obj.action = "editPath";
        return obj;
        //controller.update(public.getId());
    };
    return public;
};

/*var multiCommandInstance;

var multiCommand = function () {
        var public = {};
        var private = {};
        private.commands = new Array();
        private.commandAction;
        public.pushCommand = function (cmd) {
            private.commands.push(cmd);
        }
        private.executedCommands = new Array();
        public.getCommands = function () {
            return private.commands;
        }
        public.getCommandAction = function () {
            if (private.commands[0])
                return private.commands[0].getCommandAction();
            else if (private.executedCommands[0])
                return private.executedCommands[0].getCommandAction();
        }
        public.setCommandAction = function (undef) {
            if (private.commands[0])
                commandAction = private.commands[0].getCommandAction();
            else if(private.executedCommands[0])
                commandAction = private.executedCommands[0].getCommandAction();
        }

        public.doAction = function () {
            var obj;
            while (private.commands.length) {

                var execute = private.commands.pop();
                obj=execute.doAction();
                executedCommands.push(execute);
            }
            
            

            multiCommandInstance = 0;
            return obj;
        };
        public.undoAction = function () {
            var obj;
            while (private.executedCommands.length) {
                var execute = private.executedCommands.pop();
                obj=execute.undoAction();
                commands.push(execute);
            }
            return obj;
        };
        multiCommandInstance = public;
        return multiCommandInstance;
}*/

