var url, width, height, oauthType, api-provider, Popup, poller;
 /*
        open window to login (maybe lightbox iframe)
        poll the window and wait for the redirect
        grab the code from the windows url
        then do the post
        */
        $.post("http://localhost:8000/login/social/", 
            {
               
                code: ,
                redirectUri: 'http://localhost/search_test.html'
            },
            function(data) {
                console.log(data);
            }
        );
    });
    
function login(provider) {    
    switch (provider) {
        case 'google':
            url = 'https://accounts.google.com/o/oauth2/auth';
            width = '452';
            height = '633';
            oauthType = '2.0';
            
            break;
    }
    Popup = openwindow(url, width, height);
    poller = setInterval(pollWindow, 20);
}

function openwindow(url, width, height) {
    var $window = $(window),
        width = width || 500,
        height = height || 500,
        left = $window.screenX + (($window.outerWidth - width) / 2),
        top = $window.screenY + (($window.outerHeight - height) / 2.5);
        options = 'width=' + width +',height=' + height + ',left=' + left + ',top=' + top + 
            ',location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no';
   return $window.openwindow(url, 'login', options);
}

function pollWindow(width, height) {
    
    
    try {
          var popupWindowPath = Popup.location,
              
          var baseOptions = width: width,
            height: height,
            
          // Redirect has occurred.
          if (popupWindowPath === redirectUriPath) {
                // Contains query/hash parameters as expected.
                if (Popup.popupWindow.location.search || Popup.popupWindow.location.hash) {
                  var queryParams = Popup.popupWindow.location.search.substring(1).replace(/\/$/, '');
                  var hashParams = Popup.popupWindow.location.hash.substring(1).replace(/[\/$]/, '');
                  var hash = utils.parseQueryString(hashParams);
                  var qs = utils.parseQueryString(queryParams);

                  angular.extend(qs, hash);

                  if (qs.error) {
                    deferred.reject(qs);
                  } else {
                    deferred.resolve(qs);
                  }
                } else {
                  // Does not contain query/hash parameters, can't do anything at this point.
                  deferred.reject(
                    'Redirect has occurred but no query or hash parameters were found. ' +
                    'They were either not set during the redirect, or were removed before Satellizer ' +
                    'could read them, e.g. AngularJS routing mechanism.'
                  );
                }

                $interval.cancel(polling);
                Popup.popupWindow.close();
              }
            } catch (error) {
              // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
              // A hack to get around same-origin security policy errors in IE.
            }
          }, 20);
    
    
