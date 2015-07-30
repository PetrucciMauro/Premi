
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global text */

var insertEditRemoveInstance;
var instanced = 0;
var insertEditRemove = function () {
    if (instanced === 0) {
        private = {};
        public = {};

        private.presentazione = {};
        private.presentazione.meta = {};
        private.presentazione.data_ultima_modifica;
        private.presentazione.id;
        private.presentazione.titolo;
        private.presentazione.proper = {};
        private.presentazione.proper.paths = {};
        private.presentazione.proper.paths.main = new Array();
        private.presentazione.proper.paths.choices = new Array();
        private.presentazione.proper.texts = new Array();
        private.presentazione.proper.frames = new Array();
        private.presentazione.proper.images = new Array();
        private.presentazione.proper.SVGs = new Array();
        private.presentazione.proper.audios = new Array();
        private.presentazione.proper.videos = new Array();
        private.presentazione.proper.background = {};
        private.presentazione.proper.background.color = "rgba(255,255,255,1)";
        private.presentazione.proper.background.image = "undefined";

        public.constructPresentazione = function (newPresentazione) {
            private.presentazione = newPresentazione;
        }
        public.getPresentazione = function () {
            return private.presentazione;
        };
        public.getIdPresentazione = function () {
            return private.presentazione.id;
        };
        public.getElement = function (id) {
            var element;
            var found = false;
            for (var i = 0; i < private.presentazione.proper.texts.length && !found; i++) {
                if (private.presentazione.proper.texts[i].id === id) {
                    element = private.presentazione.proper.texts[i];
                    found = true;
                }
            }
            for (var i = 0; i < private.presentazione.proper.frames.length && !found; i++) {
                if (private.presentazione.proper.frames[i].id === id) {
                    console.log("trovato");
                    element = private.presentazione.proper.frames[i];
                    found = true;
                }
            }
            for (var i = 0; i < private.presentazione.proper.images.length && !found; i++) {
                if (private.presentazione.proper.images[i].id === id) {
                    element = private.presentazione.proper.images[i];
                    found = true;
                }
            }

            for (var i = 0; i < private.presentazione.proper.SVGs.length && !found; i++) {
                if (private.presentazione.proper.SVGs[i].id === id) {
                    element = private.presentazione.proper.SVGs[i];
                    found = true;
                }
            }

            for (var i = 0; i < private.presentazione.proper.audios.length && !found; i++) {
                if (private.presentazione.proper.audios[i].id === id) {
                    element = private.presentazione.proper.audios[i];
                    found = true;
                }
            }

            for (var i = 0; i < private.presentazione.proper.videos.length && !found; i++) {
                if (private.presentazione.proper.videos[i].id === id) {
                    element = private.presentazione.proper.videos[i];
                    found = true;
                }
            }

            if (!found && private.presentazione.proper.background.id === id) {
                element = private.presentazione.proper.background;
            }
            console.log(element);
            return JSON.stringify(element);
        };
/*AGGIUNTI DA BUSETTO*/
        public.getFrames = function(){
            return private.presentazione.proper.frames;
        };
        public.getTexts = function(){
            return private.presentazione.proper.texts;
        };
        public.getImages = function(){
            return private.presentazione.proper.images;
        };
        public.getAudios = function(){
            return private.presentazione.proper.audios;
        };
        public.getVideos = function(){
            return private.presentazione.proper.videos;
        };
        public.getSVGs = function(){
            return private.presentazione.proper.SVGs;
        };
        public.getBackground = function(){
            return private.presentazione.proper.background;
        };
/*AGGIUNTI DA BUSETTO*/
        public.insertText = function (spec) {
            var newText = text(spec);
            private.presentazione.proper.texts.push(newText);
        };
        public.insertFrame = function (spec) {
            var newFrame = frame(spec);
            private.presentazione.proper.frames.push(newFrame);
        };
        public.insertImage = function (spec) {
            var newImage = image(spec);
            private.presentazione.proper.images.push(newImage);
        };
        public.insertSVG = function (spec) {
            var newSVG = SVG(spec);
            private.presentazione.proper.SVGs.push(newSVG);
        };
        public.insertAudio = function (spec) {
            var newAudio = audio(spec);
            private.presentazione.proper.audios.push(newAudio);
        };
        public.insertVideo = function (spec) {
            var newVideo = video(spec);
            private.presentazione.proper.videos.push(newVideo);
        };
        public.insertBackground = function (spec) {
            var oldBackground = {};
            oldBackground = private.presentazione.proper.background;
            private.presentazione.proper.background = spec;
            return oldBackground;
        };

        public.removeText = function (id) {
            var found = false;
            var oldText = {};
            for (var i = 0; i < private.presentazione.proper.texts.length && !found; i++) {
                if (private.presentazione.proper.texts[i].id === id) {
                    oldText = private.presentazione.proper.texts.splice(i, 1);
                    found = true;
                }
            }
            return oldText[0];
        };
        public.removeImage = function (id) {
            var found = false;
            var oldImage = {};
            for (var i = 0; i < private.presentazione.proper.images.length && !found; i++) {
                if (private.presentazione.proper.images[i].id === id) {
                    oldImage = private.presentazione.proper.images.splice(i, 1);
                    found = true;
                }
            }
            return oldImage[0];
        };
        public.removeFrame = function (id) {
            var found = false;
            var oldFrame = {};
            for (var i = 0; i < private.presentazione.proper.frames.length && !found; i++) {
                if (private.presentazione.proper.frames[i].id === id) {
                    oldFrame = private.presentazione.proper.frames.splice(i, 1);
                    found = true;
                }
            }
            return oldFrame[0];
        };
        public.removeAudio = function (id) {
            var found = false;
            var oldAudio = {};
            for (var i = 0; i < private.presentazione.proper.audios.length && !found; i++) {
                if (private.presentazione.proper.audios[i].id === id) {
                    oldAudio = private.presentazione.proper.audios.splice(i, 1);
                    found = true;
                }
            }
            return oldAudio[0];
        };
        public.removeVideo = function (id) {
            var found = false;
            var oldVideo = {};
            for (var i = 0; i < private.presentazione.proper.videos.length && !found; i++) {
                if (private.presentazione.proper.videos[i].id === id) {
                    oldVideo = private.presentazione.proper.videos.splice(i, 1);
                    found = true;
                }
            }
            return oldVideo[0];
        };
        public.removeSVG = function (id) {
            var found = false;
            var oldSVG = {};
            for (var i = 0; i < private.presentazione.proper.SVGs.length && !found; i++) {
                if (private.presentazione.proper.SVGs[i].id === id) {
                    oldSVG = private.presentazione.proper.SVGs.splice(i, 1);
                    found = true;
                }
            }
            return oldSVG[0];
        };
        public.editPosition = function (spec) {
            var value = spec.tipo + "s";
            var found = false;
            var oldPosition = {};

            for (var i = 0; i < private.presentazione.proper[value].length && !found; i++) {
                if (private.presentazione.proper[value][i].id === spec.id) {
                    oldPosition.xIndex = private.presentazione.proper[value][i].xIndex;
                    oldPosition.yIndex = private.presentazione.proper[value][i].yIndex;
                    private.presentazione.proper[value][i].xIndex = spec.xIndex;
                    private.presentazione.proper[value][i].yIndex = spec.yIndex;
                    found = true;
                }
            }
            return oldPosition;
        };
        public.editRotation = function (spec) {
            var value = spec.tipo + "s";
            var found = false;
            var oldRotation;
            for (var i = 0; i < private.presentazione.proper[value].length && !found; i++) {
                if (private.presentazione.proper[value][i].id === spec.id) {
                    oldRotation = private.presentazione.proper[value][i].rotation;
                    private.presentazione.proper[value][i].rotation = spec.rotation;

                    found = true;
                }
            }
            return oldRotation;
        };
        public.editSize = function (spec) {
            var value = spec.tipo + "s";
            var found = false;
            var oldSize = {};

            for (var i = 0; i < private.presentazione.proper[value].length && !found; i++) {
                if (private.presentazione.proper[value][i].id === spec.id) {
                    oldSize.height = private.presentazione.proper[value][i].height;
                    oldSize.width = private.presentazione.proper[value][i].width;
                    private.presentazione.proper[value][i].height = spec.height;
                    private.presentazione.proper[value][i].width = spec.width;
                    found = true;
                }
            }
            return oldSize;
        };

        public.editBackground = function (spec) {
            var found = false;
            var oldBackground = {};

            for (var i = 0; i < private.presentazione.proper.frames.length && !found; i++) {
                if (private.presentazione.proper.frames[i].id === spec.id) {
                    oldBackground.backgroundimage = private.presentazione.proper.frames[i].backgroundimage;
                    oldBackground.backgroundcolor = private.presentazione.proper.frames[i].backgroundcolor;
                    private.presentazione.proper.frames[i].backgroundimage = spec.ref;
                    private.presentazione.proper.frames[i].backgroundcolor = spec.color;
                    found = true;
                }
            }
            return oldBackground;
        };

        public.editColor = function (spec) {
            var value = spec.tipo + "s";
            var found = false;
            var oldColor;
            for (var i = 0; i < private.presentazione.proper[value].length && !found; i++) {
                if (private.presentazione.proper[value][i].id === spec.id) {
                    oldColor = private.presentazione.proper[value][i].color;
                    private.presentazione.proper[value][i].color = spec.color;

                    found = true;
                }
            }
            return oldColor;
        };

        public.editShape = function (spec) {
            var found = false;
            var oldShape;
            for (var i = 0; i < private.presentazione.proper.SVGs.length && !found; i++) {
                if (private.presentazione.proper.SVGs[i].id === spec.id) {
                    oldShape = private.presentazione.proper.SVGs[i].shape;
                    private.presentazione.proper.SVGs[i].shape = spec.shape;
                    found = true;
                }
            }
            return oldShape;
        };

        public.editContent = function (spec) {
            var found = false;
            var oldContent;
            for (var i = 0; i < private.presentazione.proper.texts.length && !found; i++) {
                if (private.presentazione.proper.texts[i].id === spec.id) {
                    oldContent = private.presentazione.proper.texts[i].content;
                    private.presentazione.proper.texts[i].content = spec.content;
                    found = true;
                }
            }
            return oldContent;
        };

        public.editFont = function (spec) {
            var found = false;
            var oldFont;
            for (var i = 0; i < private.presentazione.proper.texts.length && !found; i++) {
                if (private.presentazione.proper.texts[i].id === spec.id) {
                    oldContent = private.presentazione.proper.texts[i].font;
                    private.presentazione.proper.texts[i].font = spec.font;
                    found = true;
                }
            }
            return oldFont;
        };

        public.addFrameToMainPath = function (spec) {
            var pos = spec.pos || private.presentazione.proper.paths.main.length;
            var id = spec.id;
            private.presentazione.proper.paths.main.splice(pos, 0, id);

        };
        public.removeFrameFromMainPath = function (id) {
            var oldFrame = {};
            var found = false;
            for (var i = 0; i < private.presentazione.proper.paths.main.length && !found; i++) {
                if (private.presentazione.proper.paths.main[i] === id) {
                    oldFrame.pos = i;
                    oldFrame.id = id;
                    private.presentazione.proper.paths.main.splice(i, 1);
                    found = true;
                }
            }
            return oldFrame;
        };

        public.addChoicePath = function (id) {
            var path = {};
            var l = private.presentazione.proper.paths.choices.length;
            if (l > 0) {
                path.pathId = private.presentazione.proper.paths.choices[l - 1].pathId + 1;
            }
            else {
                path.pathId = 0;
            }
            path.choicePath = new Array();
            path.choicePath.push(id);
            private.presentazione.proper.paths.choices.push(path);
            return path.pathId;
        };


        public.deleteChoicePath = function (pathId) {
            var obj = {};
            var found = false;
            for (var i = 0; i < private.presentazione.proper.paths.choices.length && !found; i++) {
                if (private.presentazione.proper.paths.choices[i].pathId === pathId) {
                    l = i;
                    obj = private.presentazione.proper.paths.choices[i];
                    found = true;
                }
            }
            obj = private.presentazione.proper.paths.choices.splice(l, 1);
            return obj;
        };

        public.addFrameToChoicePath = function (spec) {
            var l;
            var found = false;
            var pathId = spec.pathId;
            var oldFrame = {};
            l = 0;
            for (var i = 0; i < private.presentazione.proper.paths.choices.length && !found; i++) {
                if (private.presentazione.proper.paths.choices[i].pathId === pathId) {
                    l = i;
                    found = true;
                }
            }
            var pos = spec.pos || private.presentazione.proper.paths.choices[l].choicePath.length;
            var id = spec.id;
            private.presentazione.proper.paths.choices[l].choicePath.splice(pos, 0, id);
        };

        public.removeFrameFromChoicePath = function (spec) {
            var l;
            var found = false;
            var pathId = spec.pathId;
            var id = spec.id;
            l = 0;
            for (var i = 0; i < private.presentazione.proper.paths.choices.length && !found; i++) {
                if (private.presentazione.proper.paths.choices[i].pathId === pathId) {
                    l = i;
                    found = true;
                }
            }
            var pos;
            for (var i = 0; i < private.presentazione.proper.paths.choices[l].choicePath.length && !found; i++) {
                if (private.presentazione.proper.paths.choices[l].choicePath[i] === id) {
                    pos = i;
                    found = true;
                }
            }
            var obj = {};
            obj.pathId = pathId;
            obj.id = id;
            obj.pos = pos;
            private.presentazione.proper.paths.choices[l].choicePath.splice(pos, 1);
            return obj;
        };

        instanced = 1;
        insertEditRemoveInstance = public;
    }
    return insertEditRemoveInstance;
};


