module.exports = function(config){
  config.set({

    basePath : '../',


    files : [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-material/angular-material-mocks.js',
      'bower_components/angular-material/angular-material.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-resource/angular-resource.js',

      'lib/ngStorage.js',

      'serverRelation/*.js',

      'scripts/slideshowelement.js',
      'scripts/inserteditremove.js',
      'scripts/command.js',

      'scripts/app.js',
      'scripts/services.js',
      'scripts/accessController.js',
      'scripts/editController.js',
      'scripts/executionController.js',
      'scripts/homeController.js',
      'scripts/profileController.js',

      'test/unit/*.js'
      
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
      'karma-coveralls',
      'karma-requirejs'
 
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
