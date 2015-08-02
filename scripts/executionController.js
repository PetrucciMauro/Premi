'use strict';

var premiExecutionController = angular.module('premiExecutionController', ['premiService'])

premiExecutionController.controller('ExecutionController',['$scope', 'Main', 'toPages', 'Utils', '$window',
	function($scope, Main, toPages, Utils, $window) {
		if(Utils.isUndefined(Main.getToken()))//check che sia autenticato
			toPages.loginpage();

    
}])