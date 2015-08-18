/*
* Name :  accessControllerSpec.js
* Module : UnitTest
* Location : test/unit
*
* History :
* Version       Date        Programmer                  Description
* =================================================================================================
* 0.0.1        30/07/2015   Petrucci Mauro              Unit test for Home Controller
* =================================================================================================
*
*/

describe('Authentication Controller Test', function(){

	var scope;
	var controller;

	beforeEach(function(){		
		angular.module('ngRoute');
		angular.module('ngMaterial');
		angular.module('ngAnimate');
		angular.mock.module('premiApp');
		angular.mock.module('premiService');
		angular.module('ngStorage');
		inject(['$rootScope','$controller','$localStorage','$http' ,function($rootScope, $controller,$localStorage,$http){
			this.$http = $http;
			this.$localStorage= $localStorage;
			scope = $rootScope.$new();
			controller = $controller('HomeController', { $scope : scope });
		}]);
	});

	it('controller is defined', function() {
		expect(controller).toBeDefined();
	});

	it('display_limit is defined', function() {
		expect(scope.display_limit).toBeDefined();
	});


/*
    			it('mongo is defined', function() {
		expect(scope.mongo).toBeDefined();
	});


				it('all slideshow is defined', function() {
		expect(scope.allSS).toBeDefined();
	});*/







});

