/*
  Dummy object for catching navigator.idSSO calls
  before the actual idSSO iframe has finished loading.
  The passed objects will be used to call watch, request,
  and/or logout immediately when the iframe has loaded.
*/
navigator.idSSO = {
  watch: function(watchObject) {
    this.watch = watchObject;
  },
  request: function(requestObject) {
    this.request = requestObject;
  },
  logout: function(logoutObject) {
    this.logout = logoutObject;
  }
};

/*
  The personaObserver is essentially a dummy object
  until initialised through "sso_watch", and is used
  to help reroute handlers from local to owning window.
*/
var personaObserver = {
  onlogin: function() {},
  onlogout: function() {},
  onmatch: function() {},
  oncancel: function() {}
};

/*
  Try to set up the postMessage connection between the owning page
  and the persona iframe. If the iframe is not available yet,
  schedule a retry on DOMContentLoaded.
*/
(function setupInterconnection() {
  document.removeEventListener("DOMContentLoaded", setupInterconnection, false);

  var iframe = document.querySelector("#persona-iframe") || document.querySelector("#webmaker-nav iframe");
  if(!iframe) {
    setTimeout(function() {
      setupInterconnection();
    }, 100 );
    return;
  }

  /*
    set up the navigator bindings, using the onpage iframe
    (see include.html for the iframe-side of things).
  */
  function setupBindings(iframe) {
    commChan = iframe.contentWindow;

    /*
      Assign watch function, and immediately call if the
      used called navigator.idSSO.watch(...) before the
      iframe was done loading.
    */
    var preset = navigator.idSSO.watch;
    navigator.idSSO.watch = function(options) {
      options = options || {};

      personaObserver.sso_onlogin = options.onlogin;
      personaObserver.sso_onlogout = options.onlogout;
      personaObserver.sso_onmatch = options.onmatch;
      commChan.postMessage(JSON.stringify({
        type: "sso_watch",
        data: {
          loggedInUser: options.loggedInUser
        }
      }), "*");
    };
    if(typeof preset === "object") navigator.idSSO.watch(preset);

    /*
      Assign request function, and immediately call if the
      used called navigator.idSSO.request(...) before the
      iframe was done loading.
    */
    preset = navigator.idSSO.request;
    navigator.idSSO.request = function(options) {
      options = options || {};

      personaObserver.sso_oncancel = options.oncancel;
      commChan.postMessage(JSON.stringify({
        type: "sso_request",
        data: {
          privacyPolicy: options.privacyPolicy,
          returnTo: options.returnTo,
          siteLogo: options.siteLogo,
          siteName: options.siteName,
          termsOfService: options.termsOfService
        }
      }), "*");
    };
    if(typeof preset === "object")  navigator.idSSO.request(preset);

    /*
      Assign logout function, and immediately call if the
      used called navigator.idSSO.logout(...) before the
      iframe was done loading. If a user wants to do that...
    */
    preset = navigator.idSSO.logout;
    navigator.idSSO.logout = function() {
      commChan.postMessage(JSON.stringify({
        type: "sso_logout",
        data: {}
      }), "*");
    };
    if(typeof preset === "object")  navigator.idSSO.logout(preset);

    /*
     start listening for post messages
    */
    window.addEventListener("message", function(event) {
      var payload = JSON.parse(event.data);
      var fn = personaObserver[payload.type];
      if(fn) {
        switch(payload.type) {
          case "sso_onlogin":
            fn(payload.data.assertion);
            break;
          case "sso_onlogout":
          case "sso_onmatch":
          case "sso_oncancel":
            fn();
            break;
        }
      }
    }, false);

    return commChan;
  };

  /*
    Try to bind the communication channel, and if we succeed,
    inform the iframe that we want to watch SSO operations.
  */
  commChan = setupBindings(iframe);
  iframe.addEventListener("load", function() {
    commChan.postMessage(JSON.stringify({
      type: "sso_watch",
      data: {
        loggedInUser: false
      }
    }), "*");
  }, false);

}());
