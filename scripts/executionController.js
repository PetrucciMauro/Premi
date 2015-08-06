'use strict';

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
	    console.log(SharedData.getPresentazione());
	    translateImpress(SharedData.getPresentazione());

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
	    	$route.reload();
	    });
}])