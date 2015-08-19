module.exports = function(config){
  config.set({

    basePath : '../',

    frameworks: ['browserify','mocha'],


    files : [

      'test/unit_mocha/*.js',
      'serverRelation/*.js',
      'bower_components/jquery/dist/jquery.js'

    ],

   client: {
      mocha: {
        reporter: 'html', // change Karma's debug.html to the mocha web reporter
        ui: 'tdd'
      }
    },


      // coverage reporter generates the coverage
    reporters: ['progress', 'coverage','coveralls'],

    autoWatch : true,

    logLevel: config.LOG_DEBUG,

    plugins : [
      'karma-mocha',
      'karma-coverage',
      'karma-junit-reporter',
      'karma-phantomjs-launcher',
      'karma-coveralls',
      'karma-mocha-reporter',
      'karma-browserify'
 
    ],

     preprocessors : {
      'test/unit_mocha/*.js': ['browserify'],
      '**/serverRelation/*.js': 'coverage'
   },

       browserify: {
      debug: true,
      transform: [ 'brfs' ],
      prebundle: function(bundle) {
        // additional configuration, e.g. externals 
        bundle.external('foobar');
      }
    },


        // optionally, configure the reporter
    coverageReporter : {
      type : 'lcov',
      dir : 'coverage/'
    }



  });
};
