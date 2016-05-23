;(function($){
    'use strict';
    $.fn.restSocialAuthLogin = function(options) {
        if (!options || !options.provider || !options.redirect_uri || !options.client_id || !options.backend_uri) {
            throw new Error("The following items must be included in options, provider, backend_uri, redirect_uri and client_id");
        }
        if (!$.fn.restSocialAuthLogin.providers[options.provider]) {
            throw new Error("Unknown or unsupported provider.")
        }


        var provider = $.fn.restSocialAuthLogin.providers[options.provider];

        // handle scopeSeparator override
        if (options.scopeSeparator) {
            provider.params.scopeSeparator = options.scopeSeparator;
        }

        //handle scope additions
        if (options.scope && typeof options.scope === Array && options.scope.length) {
            if (!provider.params.scope) {
                provider.params.scope = [];
            }
            for (var x = 0, len = options.scope.length; x < len; x++) {
                provider.scope.push(options.scope[x]);
            }
        }

        //handle display override
        if (options.display && options.display === 'iframe') {
            provider.display.type = options.display;
        }

        /*
        We don't use an each loop here as we only want to process a login once.
        This way, it's possible to have multiple elemenets for the same login.
         */
        $(this).on('click', function(e) {
            var uri = generateUri(provider, options),
                loginWindow, pollInterval;

            e.preventDefault();
            if (provider.display && provider.display.type && provider.display.type === 'iframe') {
                // @TODO: create iframe popup
            } else {
                loginWindow = {
                    'type': 'popup',
                    'win': popupWindow(uri)
                };
            }
            pollInterval = window.setInterval(function () {
                if (loginWindow.type == 'iframe') {
                    // @TODO: check if iframe was closed
                } else {
                    if (!loginWindow.win || loginWindow.win.closed || loginWindow.win.closed === undefined) {
                        // we'll assumed a closed window means the user canceled.
                        window.clearInterval(pollInterval);
                    }
                }
                try {
                    if (checkUrl(loginWindow.win.location) === options.redirect_uri) {
                        window.clearInterval(pollInterval);
                        if (loginWindow.win.location.search || loginWindow.win.location.hash) {
                            // we substring 1 these to remove the first character eg:'?'
                            var params = parseQueryString(loginWindow.win.location.search.substring(1));


                            closeWindow(loginWindow);
                            /*$.post(
                                'https://accounts.google.com/o/oauth2/token',
                                {
                                    'code':     params.code,
                                    'client_id': options.client_id,
                                    'redirect_uri': options.redirect_uri,
                                    'client_secret': 'UhZ1saZD2lS1eZhSjH_7wdHK',
                                    'grant_type': 'authorization_code'
                                }
                            ).done(function(data) {
                                options.success.call(this, data);
                            });*/

                            params.redirect_uri = options.redirect_uri;
                            params.client_id = options.client_id;
                            $.post(options.backend_uri, params).done(function(data) {
                                if (options.success && typeof options.success === 'function') {
                                    options.success.call(this, data);
                                }
                            }).fail(function () {
                                if (options.fail && typeof options.fail === 'function') {
                                    options.fail.call(this);
                                }
                            });
                        } else {
                            closeWindow(loginWindow);
                            if (options.fail && typeof options.fail === 'function') {
                                options.fail.call(this);
                            }
                        }
                    }
                } catch (error) {
                    // since we can't get href of a 3rd party site,
                    // we poll the window waiting for the href to be come available and check it
                    // against our redirect, we catch the error here.
                }
            }, 200);

            if (loginWindow.win && loginWindow.win.focus) {
                loginWindow.win.focus();
            }
        });

        function popupWindow(uri){
            var width = provider.display.width || 500,
                height = provider.display.height || 500,
                left = window.screenX + ((window.outerWidth - width) / 2),
                top = window.screenY + ((window.outerHeight - height) / 2.5),
                windowOptions = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top +
                    ',location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no';

            return window.open(uri, 'loginPopup', windowOptions);
        }

        function openIframe(uri) {
            // @TODO genertate an overlay with an iframe in center
        }

        function closeWindow(loginWindow) {
            if (loginWindow.type === 'iframe') {
                // close iframe
                // @TODO implement
            } else {
                // close the popup
                loginWindow.win.close()
            }
        }

        function generateUri() {
            var uriParams;
            switch(provider.oauthType) {
                case '2.0':
                    uriParams = [
                        'response_type=code',
                        'client_id=' + options.client_id,
                        'redirect_uri=' + options.redirect_uri
                    ];
                    for (var param in provider.params) {
                        if (!provider.params.hasOwnProperty(param) || param == 'scopeSeparator') {
                            continue;
                        }
                        if (param == 'scope') {
                            uriParams.push(param + '=' + provider.params[param].join(provider.params['scopeSeparator']));
                        } else {
                            uriParams.push(param + '=' + provider.params[param]);
                        }
                    }
                    console.log(uriParams);
                    uriParams = uriParams.join('&');
                    return provider.uri + '?' + uriParams;
                case '1.0':
                    return ''
            }
        }

        function checkUrl(location) {
            return location.protocol + '//' + location.hostname +
                (/^\//.test(location.pathname) ? location.pathname : '/' + location.pathname);
        }

        function parseQueryString(query){
            var queryParams = {},
                parts = query.split('&'),
                pair;

            for (var x = 0, len = parts.length; x < len; x++) {
                pair = parts[x].split('=');
                queryParams[pair[0]] = pair[1] || '';
            }
            return queryParams;
        }

        return this;
    };

    $.fn.restSocialAuthLogin.providers = {
        google: {
            provider: 'google-oauth2',
            uri: 'https://accounts.google.com/o/oauth2/auth',
            params: {
                scope: ['openid', 'profile', 'email'],
                scopeSeparator: ' ',
                state: Math.random().toString(36).substr(2)
            },
            display: {
                type: 'popup',
                height: 520,
            },
            oauthType: '2.0',

        }/*,

        // @ TODO: Implement these by signing up the application
        facebook: {
            provider: 'facebook',
            uri: 'https://www.facebook.com/v2.5/dialog/oauth',
            oauthType: '2.0',
            width: 580,
            height: 400
        },
        github: {
            provider: 'github',
            uri: 'https://github.com/login/oauth/authorize',
            oauthType: '2.0',
            width: 1020,
            height: 618
        },
        instagram: {
            provider: 'instagram',
            uri: 'https://api.instagram.com/oauth/authorize',
            oauthType: '2.0'
        },
        linkedin: {
            provider: 'linkedin',
            uri: 'https://www.linkedin.com/uas/oauth2/authorization',
            oauthType: '2.0',
            width: 527,
            height: 582
        },
        tumblr: {
            provider: 'tumblr'
        },
        twitter: {
            provider: 'twitter',
            uri: 'https://api.twitter.com/oauth/authenticate',
            oauthType: '1.0',
            width: 495,
            height: 645
        },
        yahoo: {
            provider: 'yahoo-oauth2',
            uri: 'https://api.login.yahoo.com/oauth2/request_auth',
            oauthType: '2.0',
            width: 559,
            height: 519
        }
        //@ TODO tumblr, amazon, slack
//*/
    };

})(jQuery);
