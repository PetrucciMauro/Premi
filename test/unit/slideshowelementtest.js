
describe('slideshowtest', function() {
  var $jsText=text({id: 1, xIndex: 10, yIndex: 20, rotation: 2, zIndex: 0, height: 15, width: 13,  waste: 0, content: "babba", font:"arial", color:"black"});
  var $jsFrame=frame({id: 2, xIndex: 10, yIndex: 20, rotation: 2, zIndex: 0, height: 15, width: 13, waste: 0, bookmark: 1, ref:"prova", color:"rgb(2,23,244,1)"});
  var $jsImage=image({id: 3, xIndex: 10, yIndex: 20, rotation: 2, zIndex: 0, height: 15, width: 13, waste: 0, ref: "http:\\www.repubblica.it"});
  var $jsAudio=audio({id: 4, xIndex: 10, yIndex: 20, rotation: 2, zIndex: 0, height: 15, width: 13, waste: 0, ref: "http:\\www.repubblica.it"});
  var $jsVideo=video({id: 5, xIndex: 10, yIndex: 20, rotation: 2, zIndex: 0, height: 15, width: 13, waste: 0, ref: "http:\\www.repubblica.it"});
  var $jsBackground=background({id: 0, image: "http:\\www.repubblica.it", color:"rgb(2,23,244,1)"});

  var $jsSVG=SVG({id: 6, xIndex: 10, yIndex: 20, rotation: 2, zIndex: 0, height: 15, width: 13, waste: 0, bookmark: 1, color:"rgb(2,23,244,1)", shape: "0,2,3,4"});
  var pres = insertEditRemove();
  var newPres = '{"meta":{"id":1,"data_ultima_modifica":2015,"titolo":"presentazione di prova"},"proper":{"texts":[],"frames":[],"images":[],"SVGs":[],"audios":[],"videos":[],"background":[]}}';
  pres.constructPresentazione(newPres);
  pres.insertText($jsText);
  var $jsTextDue = text({id: 7, xIndex: 10, yIndex: 20, rotation: 32, zIndex: 0, height: 1, width: 134, waste: 0, content: "babba2", font: "times", color: "black"});
  pres.insertText($jsTextDue);
  pres.insertImage($jsImage);
  pres.insertAudio($jsAudio);
  pres.insertVideo($jsVideo);
  pres.insertFrame($jsFrame);
  pres.insertSVG($jsSVG);
  var $back = background({id: 0, image: "http:\\www.repubblica.it", color: "rgb(2,23,244,1)"});
  pres.insertBackground($back);
  var $back2 = background({id: 0, image: "http:\\www.facebook.com", color: "rgb(31,23,22,1)"});
  pres.insertBackground($back2);
  /*var $newPos = {id: 1, tipo: "text", xIndex:114, yIndex:32};
  pres.editPosition($newPos);*/
  var presDue = insertEditRemove();


  //var ot = pres.removeText(2);
  
  var printPresDue=JSON.stringify(presDue.getPresentazione());
var printPres=JSON.stringify(pres.getPresentazione());
//variabili di ritorno per testare se le funzioni ritornano le vecchie specifiche
var texUno;
var fram;
var img;
var aud;
var vid;
var sv;
var texDue;

    it('verifyTextConstruction', function(){
      expect (JSON.stringify($jsText)).toEqual('{"id":1,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"content":"babba","font":"arial","fontSize":1,"color":"black","type":"text"}');
    });
    it('verifyFrameConstruction', function(){
      expect (JSON.stringify($jsFrame)).toEqual('{"id":2,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"bookmark":1,"ref":"prova","color":"rgb(2,23,244,1)","type":"frame"}');
    });
    it('verifyImageConstruction', function(){
      expect (JSON.stringify($jsImage)).toEqual('{"id":3,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"url":"http:\\\\www.repubblica.it","type":"image"}');
    });
    it('verifyAudioConstruction', function(){
      expect (JSON.stringify($jsAudio)).toEqual('{"id":4,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"url":"http:\\\\www.repubblica.it","type":"audio"}');
    });
    it('verifyVideoConstruction', function(){
      expect (JSON.stringify($jsVideo)).toEqual('{"id":5,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"url":"http:\\\\www.repubblica.it","type":"video"}');
    });
    it('verifyBackgroundConstruction', function(){
      expect (JSON.stringify($jsBackground)).toEqual('{"id":0,"xIndex":0,"yIndex":0,"rotation":0,"zIndex":0,"height":0,"width":0,"waste":0,"image":"http:\\\\www.repubblica.it","color":"rgb(2,23,244,1)","type":"background"}');
    });
    it('verifySVGConstruction', function(){
      expect (JSON.stringify($jsSVG)).toEqual('{"id":6,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"shape":"0,2,3,4","color":"rgb(2,23,244,1)","type":"SVG"}');
    });
    it('verifySingleton', function(){
      expect (printPres).toEqual(printPresDue);
    });
    it('verifyInsertions', function(){
      expect (printPres).toEqual('{"meta":{"id":1,"data_ultima_modifica":2015,"titolo":"presentazione di prova"},"proper":{"texts":[{"id":1,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"content":"babba","font":"arial","fontSize":1,"color":"black","type":"text"},{"id":7,"xIndex":10,"yIndex":20,"rotation":32,"zIndex":0,"height":1,"width":134,"waste":0,"content":"babba2","font":"times","fontSize":1,"color":"black","type":"text"}],"frames":[{"id":2,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"bookmark":1,"ref":"prova","color":"rgb(2,23,244,1)","type":"frame"}],"images":[{"id":3,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"url":"","type":"image"}],"SVGs":[{"id":6,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"shape":"0,2,3,4","color":"rgb(2,23,244,1)","type":"SVG"}],"audios":[{"id":4,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"url":"","type":"audio"}],"videos":[{"id":5,"xIndex":10,"yIndex":20,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"type":"video"}],"background":{"id":0,"xIndex":0,"yIndex":0,"rotation":0,"zIndex":0,"height":0,"width":0,"waste":0,"image":"http:\\\\www.facebook.com","color":"rgb(31,23,22,1)","type":"background"}}}');
    });
    it('verifyEditPosition', function(){
      texUno = pres.editPosition({id: 1, tipo: "text", xIndex:100, yIndex: 200});
      fram = pres.editPosition({id: 2, tipo: "frame", xIndex:100, yIndex: 200});
      img = pres.editPosition({id: 3, tipo: "image", xIndex:100, yIndex: 200});
      aud = pres.editPosition({id: 4, tipo: "audio", xIndex:100, yIndex: 200});
      vid = pres.editPosition({id: 5, tipo: "video", xIndex:100, yIndex: 200});
      sv = pres.editPosition({id: 6, tipo: "SVG", xIndex:100, yIndex: 200});
      texDue = pres.editPosition({id: 7, tipo: "text", xIndex:300, yIndex: 400});
      printPres=JSON.stringify(pres.getPresentazione());
      expect (printPres).toEqual('{"meta":{"id":1,"data_ultima_modifica":2015,"titolo":"presentazione di prova"},"proper":{"texts":[{"id":1,"xIndex":100,"yIndex":200,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"content":"babba","font":"arial","fontSize":1,"color":"black","type":"text"},{"id":7,"xIndex":300,"yIndex":400,"rotation":32,"zIndex":0,"height":1,"width":134,"waste":0,"content":"babba2","font":"times","fontSize":1,"color":"black","type":"text"}],"frames":[{"id":2,"xIndex":100,"yIndex":200,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"bookmark":1,"ref":"prova","color":"rgb(2,23,244,1)","type":"frame"}],"images":[{"id":3,"xIndex":100,"yIndex":200,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"url":"","type":"image"}],"SVGs":[{"id":6,"xIndex":100,"yIndex":200,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"shape":"0,2,3,4","color":"rgb(2,23,244,1)","type":"SVG"}],"audios":[{"id":4,"xIndex":100,"yIndex":200,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"url":"","type":"audio"}],"videos":[{"id":5,"xIndex":100,"yIndex":200,"rotation":2,"zIndex":0,"height":15,"width":13,"waste":0,"type":"video"}],"background":{"id":0,"xIndex":0,"yIndex":0,"rotation":0,"zIndex":0,"height":0,"width":0,"waste":0,"image":"http:\\\\www.facebook.com","color":"rgb(31,23,22,1)","type":"background"}}}');
    });
it('verifyOldPosition', function(){
      expect (texUno.xIndex).toEqual(10);
      expect (texUno.yIndex).toEqual(20);
      expect (fram.xIndex).toEqual(10);
      expect (fram.yIndex).toEqual(20);
      expect (aud.xIndex).toEqual(10);
      expect (aud.yIndex).toEqual(20);
      expect (img.xIndex).toEqual(10);
      expect (img.yIndex).toEqual(20);
      expect (vid.xIndex).toEqual(10);
      expect (vid.yIndex).toEqual(20);
      expect (sv.xIndex).toEqual(10);
      expect (sv.yIndex).toEqual(20);
      expect (texDue.xIndex).toEqual(10);
      expect (texDue.yIndex).toEqual(20);
    });
    it('verifyEditRotation', function(){
      texUno.rotation=pres.editRotation({id: 1, tipo: "text", rotation: 360});
      fram.rotation=pres.editRotation({id: 2, tipo: "frame", rotation: 360});
      img.rotation=pres.editRotation({id: 3, tipo: "image", rotation: 360});
      aud.rotation=pres.editRotation({id: 4, tipo: "audio", rotation: 360});
      vid.rotation=pres.editRotation({id: 5, tipo: "video", rotation: 360});
      sv.rotation=pres.editRotation({id: 6, tipo: "SVG", rotation: 360});
      texDue.rotation=pres.editRotation({id: 7, tipo: "text", rotation: 360});
      printPres=JSON.stringify(pres.getPresentazione());
      expect (printPres).toEqual('{"meta":{"id":1,"data_ultima_modifica":2015,"titolo":"presentazione di prova"},"proper":{"texts":[{"id":1,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":15,"width":13,"waste":0,"content":"babba","font":"arial","fontSize":1,"color":"black","type":"text"},{"id":7,"xIndex":300,"yIndex":400,"rotation":360,"zIndex":0,"height":1,"width":134,"waste":0,"content":"babba2","font":"times","fontSize":1,"color":"black","type":"text"}],"frames":[{"id":2,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":15,"width":13,"waste":0,"bookmark":1,"ref":"prova","color":"rgb(2,23,244,1)","type":"frame"}],"images":[{"id":3,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":15,"width":13,"waste":0,"url":"","type":"image"}],"SVGs":[{"id":6,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":15,"width":13,"waste":0,"shape":"0,2,3,4","color":"rgb(2,23,244,1)","type":"SVG"}],"audios":[{"id":4,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":15,"width":13,"waste":0,"url":"","type":"audio"}],"videos":[{"id":5,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":15,"width":13,"waste":0,"type":"video"}],"background":{"id":0,"xIndex":0,"yIndex":0,"rotation":0,"zIndex":0,"height":0,"width":0,"waste":0,"image":"http:\\\\www.facebook.com","color":"rgb(31,23,22,1)","type":"background"}}}');
    });
it('verifyOldRotation', function(){
      expect (texUno.rotation).toEqual(2);
      expect (fram.rotation).toEqual(2);
      expect (img.rotation).toEqual(2);
      expect (aud.rotation).toEqual(2);
      expect (vid.rotation).toEqual(2);
      expect (sv.rotation).toEqual(2);
      expect (texDue.rotation).toEqual(32);
    });
it('verifyEditSize', function(){
      texUno=pres.editSize({id: 1, tipo: "text", height: 100, width: 800});
      fram=pres.editSize({id: 2, tipo: "frame", height: 100, width: 800});
      img=pres.editSize({id: 3, tipo: "image", height: 100, width: 800});
      aud=pres.editSize({id: 4, tipo: "audio", height: 100, width: 800});
      vid=pres.editSize({id: 5, tipo: "video", height: 100, width: 800});
      sv=pres.editSize({id: 6, tipo: "SVG", height: 100, width: 800});
      texDue=pres.editSize({id: 7, tipo: "text", height: 200, width: 500});
      printPres=JSON.stringify(pres.getPresentazione());
      expect (printPres).toEqual('{"meta":{"id":1,"data_ultima_modifica":2015,"titolo":"presentazione di prova"},"proper":{"texts":[{"id":1,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"content":"babba","font":"arial","fontSize":1,"color":"black","type":"text"},{"id":7,"xIndex":300,"yIndex":400,"rotation":360,"zIndex":0,"height":200,"width":500,"waste":0,"content":"babba2","font":"times","fontSize":1,"color":"black","type":"text"}],"frames":[{"id":2,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"bookmark":1,"ref":"prova","color":"rgb(2,23,244,1)","type":"frame"}],"images":[{"id":3,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"url":"","type":"image"}],"SVGs":[{"id":6,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"shape":"0,2,3,4","color":"rgb(2,23,244,1)","type":"SVG"}],"audios":[{"id":4,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"url":"","type":"audio"}],"videos":[{"id":5,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"type":"video"}],"background":{"id":0,"xIndex":0,"yIndex":0,"rotation":0,"zIndex":0,"height":0,"width":0,"waste":0,"image":"http:\\\\www.facebook.com","color":"rgb(31,23,22,1)","type":"background"}}}');
    });

it('verifyOldSize', function(){
      expect (texUno.height).toEqual(15);
      expect (texUno.width).toEqual(13);
      expect (fram.height).toEqual(15);
      expect (fram.width).toEqual(13);
      expect (aud.height).toEqual(15);
      expect (aud.width).toEqual(13);
      expect (img.height).toEqual(15);13
      expect (img.width).toEqual(13);
      expect (vid.height).toEqual(15);
      expect (vid.width).toEqual(13);
      expect (sv.height).toEqual(15);
      expect (sv.width).toEqual(13);
      expect (texDue.height).toEqual(1);
      expect (texDue.width).toEqual(134);
   });
it('verifyEditBackground', function(){
      fram=pres.editBackground({ref: "www.w3c.org", color: "rgb(1,2,3,1)", tipo: "frame", id: 2});
      printPres=JSON.stringify(pres.getPresentazione());
       expect (printPres).toEqual('{"meta":{"id":1,"data_ultima_modifica":2015,"titolo":"presentazione di prova"},"proper":{"texts":[{"id":1,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"content":"babba","font":"arial","fontSize":1,"color":"black","type":"text"},{"id":7,"xIndex":300,"yIndex":400,"rotation":360,"zIndex":0,"height":200,"width":500,"waste":0,"content":"babba2","font":"times","fontSize":1,"color":"black","type":"text"}],"frames":[{"id":2,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"bookmark":1,"ref":"www.w3c.org","color":"rgb(1,2,3,1)","type":"frame"}],"images":[{"id":3,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"url":"","type":"image"}],"SVGs":[{"id":6,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"shape":"0,2,3,4","color":"rgb(2,23,244,1)","type":"SVG"}],"audios":[{"id":4,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"url":"","type":"audio"}],"videos":[{"id":5,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"type":"video"}],"background":{"id":0,"xIndex":0,"yIndex":0,"rotation":0,"zIndex":0,"height":0,"width":0,"waste":0,"image":"http:\\\\www.facebook.com","color":"rgb(31,23,22,1)","type":"background"}}}');
      
    });

it('verifyOldBackground', function(){
      expect (fram.ref).toEqual("prova");
      expect (fram.color).toEqual("rgb(2,23,244,1)");
   });

it('verifyEditColor', function(){
      texUno=pres.editColor({id: 1, tipo: "text", color: "rgb(1,2,3,1)"});
      sv=pres.editColor({id: 6, tipo: "SVG", color: "rgb(1,2,3,1)"});
      texDue=pres.editColor({id: 7, tipo: "text", color: "rgb(1,2,3,1)"});
      printPres=JSON.stringify(pres.getPresentazione());
      expect (printPres).toEqual('{"meta":{"id":1,"data_ultima_modifica":2015,"titolo":"presentazione di prova"},"proper":{"texts":[{"id":1,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"content":"babba","font":"arial","fontSize":1,"color":"rgb(1,2,3,1)","type":"text"},{"id":7,"xIndex":300,"yIndex":400,"rotation":360,"zIndex":0,"height":200,"width":500,"waste":0,"content":"babba2","font":"times","fontSize":1,"color":"rgb(1,2,3,1)","type":"text"}],"frames":[{"id":2,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"bookmark":1,"ref":"www.w3c.org","color":"rgb(1,2,3,1)","type":"frame"}],"images":[{"id":3,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"url":"","type":"image"}],"SVGs":[{"id":6,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"shape":"0,2,3,4","color":"rgb(1,2,3,1)","type":"SVG"}],"audios":[{"id":4,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"url":"","type":"audio"}],"videos":[{"id":5,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"type":"video"}],"background":{"id":0,"xIndex":0,"yIndex":0,"rotation":0,"zIndex":0,"height":0,"width":0,"waste":0,"image":"http:\\\\www.facebook.com","color":"rgb(31,23,22,1)","type":"background"}}}');
    });
it('verifyOldColor', function(){
      expect (texUno).toEqual('black');
      expect (sv).toEqual('rgb(2,23,244,1)');
      expect (texDue).toEqual('black');
    });

it('verifyEditShape', function(){
      sv=pres.editShape({id: 6, tipo: "SVG", shape: "square"});
      printPres=JSON.stringify(pres.getPresentazione());
      expect (printPres).toEqual('{"meta":{"id":1,"data_ultima_modifica":2015,"titolo":"presentazione di prova"},"proper":{"texts":[{"id":1,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"content":"babba","font":"arial","fontSize":1,"color":"rgb(1,2,3,1)","type":"text"},{"id":7,"xIndex":300,"yIndex":400,"rotation":360,"zIndex":0,"height":200,"width":500,"waste":0,"content":"babba2","font":"times","fontSize":1,"color":"rgb(1,2,3,1)","type":"text"}],"frames":[{"id":2,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"bookmark":1,"ref":"www.w3c.org","color":"rgb(1,2,3,1)","type":"frame"}],"images":[{"id":3,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"url":"","type":"image"}],"SVGs":[{"id":6,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"shape":"square","color":"rgb(1,2,3,1)","type":"SVG"}],"audios":[{"id":4,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"url":"","type":"audio"}],"videos":[{"id":5,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"type":"video"}],"background":{"id":0,"xIndex":0,"yIndex":0,"rotation":0,"zIndex":0,"height":0,"width":0,"waste":0,"image":"http:\\\\www.facebook.com","color":"rgb(31,23,22,1)","type":"background"}}}');
    });

it('verifyOldShape', function(){
      expect (sv).toEqual('0,2,3,4');
    });

    it('verifyRemove', function(){
      texUno=pres.removeText(1);
      fram=pres.removeFrame(2);
      aud=pres.removeAudio(4);
      img=pres.removeImage(3);
      sv=pres.removeSVG(6);
      vid=pres.removeVideo(5);
      printPres=JSON.stringify(pres.getPresentazione());
      expect (printPres).toEqual('{"meta":{"id":1,"data_ultima_modifica":2015,"titolo":"presentazione di prova"},"proper":{"texts":[{"id":7,"xIndex":300,"yIndex":400,"rotation":360,"zIndex":0,"height":200,"width":500,"waste":0,"content":"babba2","font":"times","fontSize":1,"color":"rgb(1,2,3,1)","type":"text"}],"frames":[],"images":[],"SVGs":[],"audios":[],"videos":[],"background":{"id":0,"xIndex":0,"yIndex":0,"rotation":0,"zIndex":0,"height":0,"width":0,"waste":0,"image":"http:\\\\www.facebook.com","color":"rgb(31,23,22,1)","type":"background"}}}');
    });

        it('verifyOldObject', function(){
      expect (JSON.stringify(texUno)).toEqual('{"id":1,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"content":"babba","font":"arial","fontSize":1,"color":"rgb(1,2,3,1)","type":"text"}');
      expect (JSON.stringify(fram)).toEqual('{"id":2,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"bookmark":1,"ref":"www.w3c.org","color":"rgb(1,2,3,1)","type":"frame"}');
      expect (JSON.stringify(img)).toEqual('{"id":3,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"url":"","type":"image"}');
      expect (JSON.stringify(aud)).toEqual('{"id":4,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"url":"","type":"audio"}');
      expect (JSON.stringify(vid)).toEqual('{"id":5,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"type":"video"}');
      expect (JSON.stringify(sv)).toEqual('{"id":6,"xIndex":100,"yIndex":200,"rotation":360,"zIndex":0,"height":100,"width":800,"waste":0,"shape":"square","color":"rgb(1,2,3,1)","type":"SVG"}');
    });
    
  });
/*
  describe('$scope.grade', function() {
    var $scope, controller;

    beforeEach(function() {
      $scope = {};
      controller = $controller('premiLoginController', { $scope: $scope });
    });

    it('sets the strength to "strong" if the password length is >8 chars', function() {
      $scope.user.password = 'longerthaneightchars';
      $scope.grade();
      expect($scope.strength).toEqual('strong');
    });

    it('sets the strength to "weak" if the password length <3 chars', function() {
      $scope.user.password = 'ahhhhhh';
      $scope.grade();
      expect($scope.strength).toEqual('weak');
    });
  });
});*/
/*
var poligono=function(spec){
var public={};
var private={};
private.lati=spec.lati;
private.altezza=spec.altezza;
private.larghezza=spec.larghezza;
public.getAltezza(){
  return private.altezza;
}
public.getLarghezza(){
  return private.larghezza;
}
public.getLati(){
  return private.lati;
}
return public;
}

var rettangolo=function(spec){
spec.lati=4;
var public=poligono(spec);
var private={};
return that;
}*/