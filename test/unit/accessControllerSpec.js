/*
* Name :  accessControllerSpec.js
* Module : UnitTest
* Location : 
*
* History :
* Version       Date        Programmer                  Description
* =================================================================================================
* 
*
* 
* =================================================================================================
*
*/

describe('accessControllerSpec', function(){

	var scope;
	var controller;

	beforeEach(function(){		
		angular.module('ngRoute')
		angular.module('ngMaterial');
		angular.module('premiApp');
		angular.module('premiService');
		inject(function($rootScope, $controller){
			scope = $rootScope.$new();
			controller = $controller('HeaderController', { $scope : scope });
		});
	});

	it('controller is defined', function() {
		expect(controller).toBeDefined();
	});


});