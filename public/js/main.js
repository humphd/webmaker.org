requirejs.config({
  baseDir:'/js',
  paths: {
    'text':             '/bower/text/text',
    'jquery':           '/bower/jquery/jquery.min',
    'jquery.carousel':  '/js/lib/jquery.carouFredSel-6.2.1',
    'jquery.powertip':  '/js/lib/jquery.powertip',
    'moment':           '/bower/moment/moment',
    'social':           '/js/lib/socialmedia',
    'uri':              '/js/lib/uri',
    'tabzilla':         'https://www.mozilla.org/tabzilla/media/js/tabzilla',
    // XXX: window.__loginAPI gets templated in server-side in layout.html
    'sso-ux':            window.__loginAPI + '/js/sso-ux',
    'nunjucks':         '/js/lib/nunjucks',
    'makeapi':          '/bower/makeapi-client/src/make-api'
  },
  shim: {
    'tabzilla': ['jquery'],
    'jquery.carousel': ['jquery'],
    'sso-ux': ['jquery']
  }
});

require(['jquery','base/carousel', 'base/marquee', 'base/email-signup',
         'base/localized', 'tabzilla', 'sso-ux'],
  function ($, carousel, Marquee, privacy, localized) {
    function start() {
      'use strict';
      var $html = $('html, body');
      var $window = $(window);
      var $backToTop = $('.backToTop');

      //Footer
      $backToTop.on('click', function (e) {
        $html.animate({scrollTop : 0}, 500);
        return false;
      });
      $window.scroll(function() {
        if ($window.scrollTop() > 100) {
          $backToTop.addClass('addMore');
        } else {
          $backToTop.removeClass('addMore');
        }
      });
      carousel.attachToCTA();

      // Create Partner marquees
      if ($('ul.sponsors').length) {
        $('ul.sponsors').each(function () {
          var marquee = new Marquee(this);
          marquee.startRotation();
        });
      }

      // Set up page-specific js
      var pageJS = $('#require-js').data('page');
      if (pageJS) {
        require([pageJS]);
      }
    }

    // Wait for the DOM to be ready, and localized strings to be available
    // on the client-side.
    localized.ready(start);
  }
);
