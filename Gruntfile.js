module.exports = function( grunt ) {
  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),

    recess: {
      dist: {
        options: {
          noOverQualifying: false,
          noIDs: false,
          strictPropertyOrder: false
        },
        src: [
          "public/css/*.less"
        ]
      }
    },
    jshint: {
      files: [
        "Gruntfile.js",
        "app.js",
        "lib/**/*.js",
        "package.json",
        "public/js/*.js",
        "routes/**/*.js"
      ]
    },
    lint5: {
      views: "views",
      defaults: {
        "personaSSO": "http://foo.com",
        "page": "page",
        "makeEndpoint": "makeEndpoint"
      },
      templates: {
        "index.html": null,
        "layout.html": null,
        "learn.html": null,
        "party.html": null,
        "teach.html": null
      }
    }
  });

  grunt.loadNpmTasks( "grunt-recess" );
  grunt.loadNpmTasks( "grunt-contrib-jshint" );

  grunt.registerTask( "lint5", "HTML5 validation", function() {
    grunt.config.requires( "lint5.views" );
    grunt.config.requires( "lint5.templates" );

    var _ = grunt.util._,
        html5Lint = require( "html5-lint" ),
        nunjucks = require( "nunjucks" ),
        views = grunt.config( "lint5.views" ),
        defaults = grunt.config( "lint5.defaults" ) || {},
        templates = grunt.config( "lint5.templates" ),
        env = new nunjucks.Environment( new nunjucks.FileSystemLoader( views )),
        done = this.async(),
        files = Object.keys( templates ),
        pending = files.length,
        errors = 0;

    function complete() {
      pending--;
      if ( pending === 0 ) {
        var passed = errors === 0;
        if ( passed ) {
          grunt.log.ok( files.length + ' file' + (files.length === 1 ? '' : 's') + ' lint free.');
        }
        done( passed );
      }
    }

    files.forEach( function( file ) {
      var data = _.extend( defaults, templates[ file ] ),
          html = env.getTemplate( file ).render( data );
      html5Lint( html, function( err, results ) {
        if ( err ) {
          grunt.fatal( 'Unable to connect to validation server.' );
          return;
        }
        if ( results.messages.length ) {
          grunt.log.subhead( file );
          results.messages.forEach( function( msg ) {
            var type = msg.type, // error or warning
                message = msg.message,
                formatted = "  " + type + ": " + message;
            if ( type === 'error' ) {
              errors++;
              grunt.log.error( formatted );
            } else {
              grunt.fail.warn( formatted );
            }
          });
        }
        complete();
      });
    });
  });

  grunt.registerTask( "default", [ "recess", "jshint", "lint5" ]);
};
