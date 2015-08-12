/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Base object constructor function

function slideShowElement(spec) {
    var that={}; // Create an empty object
    var private = {};
    that.id = spec.id; 
    that.xIndex = spec.xIndex || 0;
    that.yIndex = spec.yIndex || 0;
    that.rotation = spec.rotation || 0;
    that.zIndex = spec.zIndex || 0;
    that.height = spec.height || 0;
    that.width = spec.width || 0;
    
    return that; // Return the object
}

//oggetti text
var text = function (spec) {
    var that = slideShowElement(spec);
    that.content = spec.content || "";
    that.font = spec.font || "Arial";
    that.fontSize = spec.fontSize || 1;
    that.color = spec.color || "black";
    that.type = "text";
    //ritorna that
    return that;
};

//oggetti image
var image = function (spec) {
    var that = slideShowElement(spec);
    that.url = spec.ref || "";
    that.type = "image";
    //ritorna that
    return that;
};

//oggetti audio
var audio = function (spec) {
    var that = slideShowElement(spec);
    that.url = spec.ref || "";
    that.type = "audio";
    //ritorna that
    return that;
};

//oggetti video
var video = function (spec) {
    var that = slideShowElement(spec);
    that.url = spec.ref;
    that.type = "video";
        
    //ritorna that
    return that;
};

//oggetti frame
var frame = function (spec) {
    var that = slideShowElement(spec);
    that.bookmark=spec.bookmark||0;
    that.ref=spec.ref||"";
    that.color=spec.color||"rgba(255,255,255,0)";
    that.zIndex = spec.zIndex;
    that.type = "frame";
        
    //ritorna that
    return that;
};
//oggetti SVG
var SVG = function (spec) {
    var that = slideShowElement(spec);
    that.shape = spec.shape || "";
    that.color = spec.color || "";
    that.type = "SVG";
        
    //ritorna that
    return that;
};

//oggetti background
var background = function (spec) {
    var that = slideShowElement(spec);
    that.id = 0;
    that.image = spec.image || "";
    that.color = spec.color || "rgba(255,255,255,0)";
    that.type = "background";
    //ritorna that
    return that;
};