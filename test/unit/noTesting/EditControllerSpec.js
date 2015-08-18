/*
* Name :  accessControllerSpec.js
* Module : UnitTest
* Location : test/unit
*
* History :
* Version       Date        Programmer                  Description
* =================================================================================================
* 0.0.1        30/07/2015   Petrucci Mauro              Unit test for EditController
* =================================================================================================
*
*/

describe('Edit Controller Test', function(){

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
		inject(['$rootScope','$controller','$localStorage','$http','$mdBottomSheet','$mdSidenav','$q' ,function($rootScope, $controller,$localStorage,$http,$mdBottomSheet,$mdSidenav,$q){
			this.$mdBottomSheet = $mdBottomSheet;
			this.$mdSidenav = $mdSidenav;
			this.$q = $q;
			this.$http = $http;
			this.$localStorage= $localStorage;
			scope = $rootScope.$new();
			controller = $controller('EditController', { $scope : scope });
		}]);
	});


	it('controller is defined', function() {
		expect(controller).toBeDefined();
	});
   
    it('scope.isOpen to be false', function(){
     expect(scope.isOpen).toBe(false);
 
    });

     
    it('back color should be #ffffff', function(){
    	expect(scope.backcolor).toBe('#ffffff');
    });

    /*it('should call backgroundManage function correctly',function(){
      scope.backgroundManage(false);
      expect(scope.backgroundManage).toBe(false);

    });*/




    describe('scope.demo ',function(){

       it('scope.demo.isOpen should be false',function(){
    	expect(scope.demo.isOpen).toBe(false);

       });
       it('scope.demo.count should be 0',function(){

       expect(scope.demo.count).toBe(0);
   		});
       it('scope.demo.selectedAlignment to be left',function(){
		  
		  expect(scope.demo.selectedAlignment).toBe('md-left');
   
       });
    });

    describe('BottomSheetController', function(){
        angular.module('ngRoute');
		angular.module('ngMaterial');
		angular.module('ngAnimate');
		angular.mock.module('premiApp');
		angular.mock.module('premiService');
		angular.module('ngStorage');
		inject(['$rootScope','$controller','$localStorage','$http','$mdBottomSheet','$mdSidenav','$q' ,function($rootScope, $controller,$localStorage,$http,$mdBottomSheet,$mdSidenav,$q){
			this.$mdBottomSheet = $mdBottomSheet;
			this.$mdSidenav = $mdSidenav;
			this.$q = $q;
			this.$http = $http;
			this.$localStorage= $localStorage;
			scope = $rootScope.$new();
			controller = $controller('EditController', { $scope : scope });
		}]);

			it('controller is defined', function() {
		expect(controller).toBeDefined();
	});
       
    });
	

});
