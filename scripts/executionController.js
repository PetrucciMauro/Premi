'use strict';

/*
* Name :  executionController.js
* Module : Controller::executionController
* Location : scripts/executionController.js
*
* History :
* Version       Date        Programmer                  Description
* =================================================================================================
* 0.0.1        20/07/2015   Busetto Matteo            Inizio executionController
* 0.2.0        25/07/2015   Busetto Matteo            Aggiunti reindirizzamenti con hide/show dell'header
* 0.5.0        20/07/2015   Busetto Matteo            Integrato angular con impress
* 1.0.0        01/08/2015   Busetto Matteo            Versione finale
* =================================================================================================
*
*/

var premiExecutionController = angular.module('premiExecutionController', ['premiService'])

premiExecutionController.controller('ExecutionController',['$scope', 'Main', 'toPages', 'Utils', '$route', 'SharedData',
	function($scope, Main, toPages, Utils, $route, SharedData) {
		if(Utils.isUndefined(Main.getToken()))//check che sia autenticato
			toPages.loginpage();

		var lastRoute = $route.current;

	    $scope.$on('$locationChangeSuccess', function(event) {
	    	var current = $route.current.$$route.originalPath;
	    	if(current.indexOf("execution") !== -1)
	        	$route.current = lastRoute;
	    });

	    $("#premiHeader").hide();
	    $("#premiFooter").hide();

	    //TRANSLATION
	    var json = SharedData.getPresentazione();
	    console.log(json);
	    translateImpress(json);

	    var goHome = angular.element($("#homeButton"));
	    goHome.on("click", function(){
	    	$("#premiHeader").show();
	    	$("#premiFooter").show();
	    	$("#impressMenu").remove();
	    	/*var hash = window.location.hash;
	    	var array = hash.split("%23");

	    	window.location.hash = array[0];*/
	    	$route.current = lastRoute;
	    	toPages.homepage();
	    });

	    var goEdit = angular.element($("#editButton"));
	    goEdit.on("click", function(){
	    	console.log("edit");
	    	$("#premiHeader").show();
	    	$("#premiFooter").show();
	    	$("#impressMenu").remove();
	    	/*var hash = window.location.hash;
	    	var array = hash.split("%23");

	    	window.location.hash = array[0];*/
	    	$route.current = lastRoute;
	    	toPages.editpage();
	    });
}])