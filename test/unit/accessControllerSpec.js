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
        angular.mock.module('ngMaterial');
        angular.mock.module('ngAnimate');
		module('premiApp');
		inject(function($rootScope, $controller){
			scope = $rootScope.$new();
			controller = $controller('accessController', { $scope : scope });
		});
	});

	it('controller is defined', function() {
		expect(controller).toBeDefined();
	});


});