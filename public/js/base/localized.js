define( [ 'jquery' ], function( $ ) {
  var _strings,
      _readyCallback,
      _isReady = false;

  function ready( json ) {
    // Register a callback to happen when the DOM is also up (might
    // already be up, in which case it will happen now).
    $( function() {
      _strings = json;
      _isReady = true;
      if (typeof _readyCallback === "function") {
        _readyCallback();
      }
    });
  };

  // Get the current lang from the document's HTML element, which the
  // server set when the page was first rendered. This saves us having
  // to pass extra locale info around on the URL.
  var lang = $( 'html' ).attr( 'lang' ) || 'en-US';
  $.ajax({
    type: 'GET',
    url: '/strings/' + lang,
    async: false,
    jsonpCallback: 'jsonCallback',
    contentType: 'application/json',
    dataType: 'jsonp',
    success: function( json ) {
      ready( json );
    },
    error: function( e ) {
      console.log( 'Error: ' + e);
    }
  });

  return {
    get: function( key ) {
      if ( !_strings ) {
        console.error( '[Webmaker.org] Error: string catalog not found.' );
        return '';
      }
      return ( _strings[ key ] || '' );
    },

    // Localized strings are ready
    ready: function( cb ) {
      _readyCallback = cb;
    },

    isReady: function() {
      return !!_isReady;
    }
  };
});
