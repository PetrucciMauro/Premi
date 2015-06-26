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
    reporters: ['progress', 'coverage'],

    autoWatch : true,

    frameworks: ['jasmine'],

    plugins : [
      'karma-jasmine',
      'karma-coverage',
      'karma-junit-reporter'
 
    ]
    
     preprocessors: {
      '**/app/scripts/**/*.js': 'coverage'
   }

        // optionally, configure the reporter
    coverageReporter : {
      type : 'html',
      dir : 'coverage/'
    }



  });
};
