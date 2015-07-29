/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var invokerInstace = {};
var invokerInstanced = false;
var invoker = function () {
    if (!invokerInstanced) {
        var public = {};
        var private = {};
        private.undoStack = new Array();
        private.redoStack = new Array();
        public.execute = function (com) {
            com.doAction();
            private.undoStack.push(com);
            private.redoStack = [];
        };
        public.undo = function () {
            var temp = private.undoStack.pop();
            temp.undoAction();
            private.redoStack.push(temp);
        };
        public.redo = function () {
            if (private.redoStack.length > 0) {
                var temp = private.redoStack.pop();
                temp.doAction();
                private.undoStack.push(temp);
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
    public.doAction = function () {
        public.getEnabler().insertText(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().removeText(public.getId());
        //controller.remove(id)
    };
    return public;
};

var concreteImageInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        public.getEnabler().insertImage(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().removeImage(public.getId());
        //controller.remove(id)
    };
    return public;
};

var concreteFrameInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        public.getEnabler().insertFrame(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().removeFrame(public.getId());
        //controller.remove(id)
    };
    return public;
};

var concreteSVGInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        public.getEnabler().insertSVG(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().removeSVG(public.getId());
        //controller.remove(id)
    };
    return public;
};

var concreteAudioInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        public.getEnabler().insertAudio(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().removeAudio(public.getId());
        //controller.remove(id)
    };
    return public;
};

var concreteVideoInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        public.getEnabler().insertVideo(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().removeVideo(public.getId());
        //controller.remove(id)
    };
    return public;
};

var concreteBackgroundInsertCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldBackground = {};
    public.doAction = function () {
        private.oldBackground = public.getEnabler().insertBackground(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().insertBackground(private.oldBackground);
        //controller.remove(id);
        //controller.update(oldBackground.id);
    };
    return public;
};

//REMOVE
var concreteTextRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        private.oldText = public.getEnabler().removeText(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.remove(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().insertText(private.oldText);
        //controller.update(id);
    };
    return public;
};

var concreteImageRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        private.oldImage = public.getEnabler().removeImage(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.remove(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().insertImage(private.oldImage);
        //controller.update(id);
    };
    return public;
};

var concreteFrameRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        private.oldFrame = public.getEnabler().removeFrame(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.remove(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().insertFrame(private.oldFrame);
        //controller.update(id);
    };
    return public;
};

var concreteSVGRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        private.oldSVG = public.getEnabler().removeSVG(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.remove(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().insertSVG(private.oldSVG);
        //controller.update(id);
    };
    return public;
};

var concreteAudioRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        private.oldAudio = public.getEnabler().removeAudio(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.remove(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().insertAudio(private.oldAudio);
        //controller.update(id);
    };
    return public;
};

var concreteVideoRemoveCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        private.oldVideo = public.getEnabler().removeVideo(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.remove(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().insertVideo(private.oldVideo);
        //controller.update(id);
    };
    return public;
};

//EDITING
var concreteEditPositionCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldPosition = {};
    public.doAction = function () {
        private.oldPosition = public.getEnabler().editPosition(spec);
        private.oldPosition.id = spec.id;
        private.oldPosition.tipo = spec.tipo;

        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().editPosition(private.oldPosition);
        //controller.update(public.getId());
    };
    return public;
};

var concreteEditRotationCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldRotation = {};
    public.doAction = function () {
        private.oldRotation.rotation = public.getEnabler().editRotation(spec);
        private.oldRotation.id = spec.id;
        private.oldRotation.tipo = spec.tipo;
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().editPosition(private.oldRotation);
        //controller.update(public.getId());
    };
    return public;
};

var concreteEditSizeCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldSize = {};
    public.doAction = function () {
        private.oldSize = public.getEnabler().editSize(spec);
        private.oldSize.id = spec.id;
        private.oldSize.tipo = spec.tipo;
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().editSize(private.oldSize);
        //controller.update(public.getId());
    };
    return public;
};

var concreteEditContentCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldContent = {};
    public.doAction = function () {
        private.oldContent.content = public.getEnabler().editContent(spec);
        private.oldContent.id = spec.id;
        private.oldContent.tipo = spec.tipo;
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().editContent(private.oldContent);
        //controller.update(public.getId());
    };
    return public;
};

var concreteEditBackgroundCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldBackground = {};
    public.doAction = function () {
        private.oldBackground = public.getEnabler().editBackground(spec);
        private.oldBackground.id = spec.id;
        private.oldBackground.tipo = "frames";
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().editBackground(private.oldBackground);
        //controller.update(public.getId());
    };
    return public;
};

var concreteEditColorCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldColor = {};
    public.doAction = function () {
        private.oldColor.color = public.getEnabler().editColor(spec);
        private.oldColor.id = spec.id;
        private.oldColor.tipo = spec.tipo;
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().editColor(private.oldColor);
        //controller.update(public.getId());
    };
    return public;
};

var concreteEditFontCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    private.oldFont = {};
    public.doAction = function () {
        private.oldFont.font = public.getEnabler().editFont(spec);
        private.oldFont.id = spec.id;
        private.oldFont.tipo = spec.tipo;
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().editColor(private.oldFont);
        //controller.update(public.getId());
    };
    return public;
};

//PERCORSI
var concreteAddToMainPathCommand = function (spec) {
    var public = abstractCommand(spec);
    var private = {};
    public.doAction = function () {
        public.getEnabler().addFrameToMainPath(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().removeFrameFromMainPath(spec.id);
        //controller.update(public.getId());
    };
    return public;
};

var concreteRemoveFromMainPathCommand = function (spec) {
    var public = abstractCommand(spec);
    var oldFrame = {};
    public.doAction = function () {
        oldFrame = public.getEnabler().removeFrameFromMainPath(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().addFrameToMainPath(oldFrame);
        //controller.update(public.getId());
    };
    return public;
};

var concreteAddToChoicePathCommand = function (spec) {
    var public = abstractCommand(spec);

    public.doAction = function () {
        public.getEnabler().addFrameToChoicePath(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().removeFrameFromChoicePath(spec);
        //controller.update(public.getId());
    };
    return public;
};

var concreteRemoveFromChoicePathCommand = function (spec) {
    var public = abstractCommand(spec);
    var oldFrame = {};
    public.doAction = function () {
        oldFrame = public.getEnabler().removeFrameFromChoicePath(spec);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().addFrameToChoicePath(oldFrame);
        //controller.update(public.getId());
    };
    return public;
};

var concreteNewChoicePathCommand = function (spec) {
    var public = abstractCommand(spec);
    var pathId;
    public.doAction = function () {
        pathId = public.getEnabler().addChoicePath(spec.id);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().deleteChoicePath(pathId);
        //controller.update(public.getId());
    };
    return public;
};

var concreteDeleteChoicePathCommand = function (spec) {
    var public = abstractCommand(spec);
    var oldPath = {};
    public.doAction = function () {
        oldPath = public.getEnabler().deleteChoicePath(spec.pathId);
        if (public.getExecuted() === 0) {
            public.setExecuted(1);
        }
        else {
            //controller.update(public.getId());
        }
    };
    public.undoAction = function () {
        public.getEnabler().addChoicePath(oldPath);
        //controller.update(public.getId());
    };
    return public;
};
