module.exports = function(config){
  config.set({

    basePath : '../',


    files : [
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'scripts/**/*.js',
      'test/unit/**/*.js',
      'binary-extensions.json'
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
      '**/scripts/**/*.js': 'coverage'
   },

        // optionally, configure the reporter
    coverageReporter : {
      type : 'lcov',
      dir : 'coverage/'
    }



  });
};
