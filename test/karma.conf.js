module.exports = function(config){
  config.set({

    basePath : '../',


    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/scripts/**/*.js',
      'test/unit/**/*.js'
    ],


      // coverage reporter generates the coverage
    reporters: ['progress', 'coverage','coveralls'],

    autoWatch : true,

    frameworks: ['jasmine'],

    plugins : [
      'karma-jasmine',
      'karma-coverage',
      'karma-junit-reporter',
      'karma-phantomjs-launcher',
      'karma-coveralls'
 
    ],
    
     preprocessors : {
      '**/app/scripts/**/*.js': 'coverage'
   },

        // optionally, configure the reporter
    coverageReporter : {
      type : 'lcov',
      dir : 'coverage/'
    }



  });
};
