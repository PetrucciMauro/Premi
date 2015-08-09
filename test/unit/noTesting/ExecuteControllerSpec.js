/*
* Name :  accessControllerSpec.js
* Module : UnitTest
* Location : test/unit
*
* History :
* Version       Date        Programmer                  Description
* =================================================================================================
* 0.0.1        30/07/2015   Petrucci Mauro              Unit test for ExecutionController
* =================================================================================================
*
*/

describe('Execution Controller Test', function(){

	var scope;
	var controller;
	var user;


	beforeEach(function(){		
		angular.module('ngRoute');
		angular.module('ngMaterial');
		angular.module('ngAnimate');
		angular.mock.module('premiApp');
		angular.mock.module('premiService');
		angular.module('ngStorage');
		inject(['$rootScope','$controller','$localStorage','$http','$mdBottomSheet','$mdSidenav','$q','$route' ,function($rootScope, $controller,$localStorage,$http,$mdBottomSheet,$mdSidenav,$q,$route){
			this.$mdBottomSheet = $mdBottomSheet;
			this.$mdSidenav = $mdSidenav;
			this.$q = $q;
			this.$http = $http;
			this.$localStorage= $localStorage;
			this.$route= $route;
			scope = $rootScope.$new();
			controller = $controller('ExecutionController', { $scope : scope });
		}]);
	});

	it('controller is defined', function() {
	expect(controller).toBeDefined();
	});

});