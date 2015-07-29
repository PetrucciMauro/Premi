'use strict';

describe('service',function() {


  //load modules
  
  beforeEach(function(){
     
     angular.module('ngRoute');
     angular.module('ngMaterial');
     angular.module('ngAnimate');
     angular.mock.module('premiApp');
     angular.mock.module('premiService');
     angular.module('ngStorage');

  });

    beforeEach(inject(['$localStorage', function($localStorage){
    this.$localStorage = $localStorage;
  }]));
  
  // Test service availability
  it('check the existence of Main factory', inject(function(Main) {
  expect(Main).toBeDefined();
  }));
    it('check the existence of toPages factory', inject(function(toPages) {
  expect(toPages).toBeDefined();
  }));
    it('check the existence of Utils factory', inject(function(Utils) {
  expect(Utils).toBeDefined();
  }));
    it('check the existence of Upload factory', inject(function(Upload) {
  expect(Upload).toBeDefined();
  }));
    it('check the existence of SharedData factory', inject(function(SharedData) {
  expect(SharedData).toBeDefined();

  }));

});

