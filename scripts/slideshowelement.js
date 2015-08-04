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
    that.height = spec.height || 0;
    that.width = spec.width || 0;
    
    return that; // Return the object
}

//oggetti text
var text = function (spec) {
    var that = slideShowElement(spec);
    that.content = spec.content;
    that.font = spec.font;
    that.color = spec.color;
    //ritorna that
    return that;
};

//oggetti image
var image = function (spec) {
    var that = slideShowElement(spec);
    that.url = spec.ref;
    //ritorna that
    return that;
};

//oggetti audio
var audio = function (spec) {
    var that = slideShowElement(spec);
    that.url = spec.ref;
    //ritorna that
    return that;
};

//oggetti video
var video = function (spec) {
    var that = slideShowElement(spec);
    that.url = spec.ref;
        
    //ritorna that
    return that;
};

//oggetti frame
var frame = function (spec) {
    var that = slideShowElement(spec);
    that.bookmark=spec.bookmark||0;
    that.backgroundimage=spec.backgroundimage||"undefined";
    that.backgroundcolor=spec.backgroundcolor||"rgba(0,0,0,0)";
    that.zIndex=spec.zIndex;
        
    //ritorna that
    return that;
};
//oggetti SVG
var SVG = function (spec) {
    var that = slideShowElement(spec);
    that.shape = spec.shape;
    that.color = spec.color;
        
    //ritorna that
    return that;
};

//oggetti background
var background = function (spec) {
    var that = slideShowElement(spec);
    that.url = spec.ref || "";
    that.color = spec.color;
    //ritorna that
    return that;
};