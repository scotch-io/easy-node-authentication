var AWS        = require('aws-sdk');
AWS.config.loadFromPath('./config/aws.json');
var s3         = new AWS.S3(),
    configAuth = require('./../config/auth'),
    fs         = require('fs'),
    async      = require('async'),
    request    = require('request'),
    ejs        = require('ejs');

module.exports = function(app, passport) {

    function randomString(len, bits, upper) {
        bits = bits || 36;
        var outStr = '', newStr;
        while (outStr.length < len) {
            newStr  = Math.random().toString(bits).slice(2);
            outStr += newStr.slice(
              0, Math.min(newStr.length, (len - outStr.length))
            );
        }
        return upper ? outStr.toUpperCase() : outStr;
    }

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // BULLHORN SECTION =========================
    app.get('/bullhorn', isLoggedIn, function(req, res) {
        var snsExpire = {weibo: false, facebook: false};
        for (var i in snsExpire) {
            if (req.user[i].token) {
                req.user[i].expires_at = req.user[i].expires_at || 0;
                req.user[i].expires_at = parseInt(req.user[i].expires_at);
                snsExpire[i] = req.user[i].expires_at <= Math.ceil(new Date().getTime() / 1000);
            }
        }
        var userExt = {
            tumblr : {}
        };
        if (configAuth.tumblrAuth) {
            userExt.tumblr = configAuth.tumblrAuth;
        }
        res.render('bullhorn.ejs', {
            user    : req.user,
            expired : snsExpire,
            userExt : userExt
        });
    });
    app.post('/pin', isLoggedIn, function(req, res) {
        var imgUrls = [];
        var files   = [];
        for (var i in req.files) {
            files.push(req.files[i]);
        }

        var content = req.body['txt-content'] || '';
        if (!content) {
            var error = 'Content can not be empty!';
            res.json({'error': error});
            console.log(error);
            return;
        }

        function share() {
            if (!imgUrls.length) {
                res.json({error: 'No images to Pin!'});
                return;
            }
            res.json({data: imgUrls});
        }

        async.each(files, function(file, callback) {
            if (!file.size) {
                callback();
                return;
            }
            fs.readFile(file.path, function(err, file_buffer) {
                var s3Params = {
                    Bucket      : configAuth.awsAuth.bucket,
                    Key         : randomString(32) + '-' + file.name.replace(/ /g, '_'),
                    ACL         : 'public-read',
                    Body        : file_buffer,
                    ContentType : file.type || 'image/png'
                };
                s3.putObject(s3Params, function (perr, pres) {
                    if (perr) {
                        callback('[AWS] Error uploading data: ', perr);
                        return perr;
                    }
                    var imgUrl = 'http://' + s3Params.Bucket + '/' + s3Params.Key;
                    imgUrls.push(imgUrl);
                    callback();
                });
            });
        }, function(err) {
            // if any of the saves produced an error, err would equal that error
            if (err) {
                // One of the iterations produced an error.
                // All processing will now stop.
                res.json({'error': err});
                console.log(err);
                return;
            }
            share();
        });
    });
    app.post('/shout', isLoggedIn, function(req, res) {
        var imgUrls = [];
        var files   = [];
        for (var i in req.files) {
            files.push(req.files[i]);
        }

        var toSNS   = [];
        if (req.body['sns-facebook'] === 'on') {
            toSNS.push('facebook');
        }
        if (req.body['sns-twitter'] === 'on') {
            toSNS.push('twitter');
        }
        if (req.body['sns-renren'] === 'on') {
            toSNS.push('renren');
        }
        if (req.body['sns-renren'] === 'on') {
            toSNS.push('weibo');
        }
        if (req.body['sns-tumblr'] === 'on') {
            toSNS.push('tumblr');
        }

        var data = {};

        data['product_name']      = req.body['product_name'] || '';
        data['model_number']      = req.body['model_number'] || '';
        data['current_price']     = req.body['current_price'] || '';
        data['seller']            = req.body['seller'] || '';
        data['pb_url']            = req.body['pb_url'] || '';
        data['dis_percentage']    = req.body['dis_percentage'] || '';
        data['dis_amount']        = req.body['dis_amount'] || '';
        data['lowest_price']      = req.body['lowest_price'] === 'on' ? 1 : 0;
        data['lowest_difference'] = req.body['lowest_difference'] || '';
        data['lowest_time']       = req.body['lowest_time'] || '';
        data['product_desc']      = req.body['product_desc'] || '';
        data['product_image']     = req.body['product_image'] || '';
        data['custom_tag']        = req.body['custom_tag'] || '';

        console.log(data);
        if (!data) {
            var error = 'Product information can not be empty';
            res.json({'error': error});
            console.log(error);
            return;
        }

        var content = getContent(data);
        console.log(content);
        
        // var content = req.body['txt-content'] || '';
        if (!content) {
            var error = 'Content can not be empty!';
            res.json({'error': error});
            console.log(error);
            return;
        }

        function getContent(data) {
            if (!toSNS) {
                return null;
            }

            var template_map   = {'twitter': 'twitter', 'weibo': 'twitter', 'facebook': 'tumblr', 'tumblr': 'tumblr', 'renren': 'tumblr'};
            var templatePath   = './views/' + template_map[toSNS[0]] + '_template.ejs';
            var templateString = null;

            try{
                templateString = fs.readFileSync(templatePath, 'utf-8');
            } catch(err) {
                console.log(err);
            }

            var content  = ejs.render(templateString, {'data': data});

            return content;
        }

        function share() {
            strImgUrls  = imgUrls.join(' ');
            content += strImgUrls.length > 0 ? (' ' + strImgUrls) : '';

            async.each(toSNS, function(sns, callback) {
                switch (sns) {
                    case 'facebook':
                        var FB = require('fb');
                        FB.setAccessToken(req.user.facebook.token);
                        FB.api('me/feed', 'post', {message: content}, function (res) {
                            if (!res || res.error) {
                                callback({
                                    sns   : 'facebook',
                                    error : res ? res.error : 'Error occurred!'
                                });
                                return;
                            }
                            callback();
                            console.log('[Facebook] Post id: ' + res.id);
                        });
                        break;
                    case 'twitter':
                        var twitterAPI = require('node-twitter-api');
                        var twitter    = new twitterAPI({
                            consumerKey    : configAuth.twitterAuth.consumerKey,
                            consumerSecret : configAuth.twitterAuth.consumerSecret,
                            callback       : configAuth.twitterAuth.callbackURL
                        });
                        twitter.statuses(
                            'update',
                            {status: content},
                            req.user.twitter.token,
                            req.user.twitter.tokenSecret,
                            function (error, data, response) { // data contains the data sent by twitter
                                if (error) {
                                    callback({
                                        sns   : 'twitter',
                                        error : error
                                    });
                                    return;
                                }
                                callback();
                                console.log('[Twitter] OK!');
                                // consolg.log(JSON.stringify(data));
                            }
                        );
                        break;
                    case 'renren':
                        request.post(
                            'https://api.renren.com/v2/feed/put',
                            {form: {
                                access_token : req.user.renren.token,
                                message      : content,
                                title        : 'PriceBeater',
                                description  : 'PriceBeater',
                                targetUrl    : 'http://www.pricebeater.ca'
                            }},
                            function (error, response, body) {
                                if (error) {
                                    callback({
                                        sns   : 'renren',
                                        error : error
                                    });
                                    return;
                                }
                                callback();
                                console.log('[Renren] OK!');
                                // consolg.log(JSON.stringify(body));
                            }
                        );
                        break;
                    case 'weibo':
                        request.post(
                            'https://api.weibo.com/2/statuses/update.json',
                            {form: {
                                access_token : req.user.weibo.token,
                                status       : content,
                                rip          : '75.126.104.238' // $ ping goyourmommy.com # by @leaskh
                            }},
                            function (error, response, body) {
                                if (error) {
                                    callback({
                                        sns   : 'weibo',
                                        error : error
                                    });
                                    return;
                                }
                                callback();
                                console.log('[Weibo] OK!');
                                // consolg.log(JSON.stringify(body));
                            }
                        );
                        break;
                    case 'tumblr':
                        var nodemailer = require('nodemailer'),
                            transport  = nodemailer.createTransport(
                                configAuth.tumblrAuth.nodemailerTransport.type,
                                configAuth.tumblrAuth.nodemailerTransport.option
                            );
                        var tblContent = req.body['txt-content'];
                        for (i = 0; i < imgUrls.length; i++) {
                            tblContent += '\n\n' + '![image ' + i + '](' + imgUrls[i] + ')';
                        }
                        transport.sendMail({
                            from    : configAuth.tumblrAuth.fromAddress,
                            to      : configAuth.tumblrAuth.postAddress,
                            subject : 'PriceBeater !m',
                            text    : tblContent
                        }, function(error, responseStatus) {
                            if (error) {
                                callback({
                                    sns   : 'tumblr',
                                    error : error
                                });
                                return;
                            }
                            callback();
                            console.log("[Tumblr] mail response: "   + responseStatus.message); // response from the server
                            console.log("[Tumblr] mail message-id: " + responseStatus.messageId); // Message-ID value used
                        });
                        break;
                    default:
                        callback({
                            sns   : 'unknow',
                            error : 'unknow_sns',
                        });
                        return error;
                }
            }, function(err) {
                if (err) {
                    res.json(err);
                    console.log(JSON.stringify(err));
                    return;
                }
                res.json({'data': 'OK'});
            });
        }

        async.each(files, function(file, callback) {
            if (!file.size) {
                callback();
                return;
            }
            fs.readFile(file.path, function(err, file_buffer) {
                var s3Params = {
                    Bucket      : configAuth.awsAuth.bucket,
                    Key         : randomString(32) + '-' + file.name.replace(/ /g, '_'),
                    ACL         : 'public-read',
                    Body        : file_buffer,
                    ContentType : file.type || 'image/png'
                };
                s3.putObject(s3Params, function (perr, pres) {
                    if (perr) {
                        callback('[AWS] Error uploading data: ', perr);
                        return perr;
                    }
                    var imgUrl = 'http://' + s3Params.Bucket + '/' + s3Params.Key;
                    imgUrls.push(imgUrl);
                    callback();
                });
            });
        }, function(err) {
            // if any of the saves produced an error, err would equal that error
            if (err) {
                // One of the iterations produced an error.
                // All processing will now stop.
                res.json({'error': err});
                console.log(err);
                return;
            }
            share();
        });

    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        var snsExpire = {weibo: false, facebook: false};
        for (var i in snsExpire) {
            if (req.user[i].token) {
                req.user[i].expires_at = req.user[i].expires_at || 0;
                req.user[i].expires_at = parseInt(req.user[i].expires_at);
                snsExpire[i] = req.user[i].expires_at <= Math.ceil(new Date().getTime() / 1000);
            }
        }

        res.render('profile.ejs', {
            user    : req.user,
            expired : snsExpire
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/bullhorn', // redirect to the secure bullhorn section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/bullhorn', // redirect to the secure bullhorn section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email', 'read_stream', 'publish_actions'] }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/bullhorn',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/bullhorn',
                failureRedirect : '/'
            }));

    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/bullhorn',
                failureRedirect : '/'
            }));

    // renren ---------------------------------

        // send to renren to do the authentication
        app.get('/auth/renren', passport.authenticate('renren', {}));

        // the callback after renren has authenticated the user
        app.get('/auth/renren/callback',
            passport.authenticate('renren', {
                successRedirect : '/bullhorn',
                failureRedirect : '/'
            }));

    // weibo ---------------------------------

        // send to weibo to do the authentication
        app.get('/auth/weibo', passport.authenticate('weibo', {}));

        // the callback after weibo has authenticated the user
        app.get('/auth/weibo/callback',
            passport.authenticate('weibo', {
                successRedirect : '/bullhorn',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // renren ---------------------------------

        // send to renren to do the authentication
        app.get('/connect/renren', passport.authorize('renren', { scope : ['publish_blog', 'publish_feed', 'publish_share'
] }));

        // the callback after renren has authorized the user
        app.get('/connect/renren/callback',
            passport.authorize('renren', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // weibo ---------------------------------

        // send to weibo to do the authentication
        app.get('/connect/weibo', passport.authorize('weibo', {}));

        // the callback after weibo has authorized the user
        app.get('/connect/weibo/callback',
            passport.authorize('weibo', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // renren ---------------------------------
    app.get('/unlink/renren', function(req, res) {
        var user          = req.user;
        user.renren.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // weibo ---------------------------------
    app.get('/unlink/weibo', function(req, res) {
        var user         = req.user;
        user.weibo.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
