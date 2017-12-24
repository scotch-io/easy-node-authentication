module.exports = function(app, passport) {

    var recaptcha = require("./recaptcha");
    var User       = require('../app/models/user');

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs', { req : req, res : res });
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user,
            message : req.flash('profileMessage').toString()
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
            res.render('auth.ejs', { 
                message: req.flash('loginMessage').toString(),
                action: "login",
                actionTitle: " Login ",
                promptLocation: "../static/pages/signup.html"
            });
        });

        // process the login form
        app.post('/login', recaptcha(passport.authenticate('local-login', {
                successRedirect : '/#profile', // redirect to the secure profile section
                failureRedirect : '/#login', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages
            }), function(req, res, next, errText) {
                req.flash('loginMessage', errText);
                res.redirect('/#login');
            }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('auth.ejs', { 
                message: req.flash('signupMessage').toString(),
                action: "signup",
                actionTitle: " Signup ",
                promptLocation: "../static/pages/login.html"
            });
        });

        // process the signup form
        app.post('/signup', recaptcha(passport.authenticate('local-signup', {
            successRedirect : '/#profile', // redirect to the secure profile section
            failureRedirect : '/#signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }), function(req, res, next, errText) {
            req.flash('signupMessage', errText);
            res.redirect('/#signup');
        }));

        // change password
        app.post('/changepass', function(req, res, done) {
            if(req.body.password1 !== req.body.password2 || !isValidPassword(req.body.password1, req.user)) {
                req.flash('profileMessage', req.body.password1 !== req.body.password2 ? "Passwords do not match" : 
                    "Incorrect password. Expected minimum 8 characters including 1 upper case letter, 1 lower case letter and 1 number. Password should not be the same as user name.");
                res.redirect('/#profile');
                return;
            }
            
            User.findOne({ 'local.email' :  req.user.local.email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                user.local.password = user.generateHash(req.body.password1);

                user.save(function(err) {
                    if (err)
                        return done(err);
                    res.send('Ok');
                });
            });
        });

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    /* locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    */
    
    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));

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

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    /* local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
    */

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}

function isValidPassword(pwd, usr){
    var ucase = new RegExp("[A-Z]+"),
        lcase = new RegExp("[a-z]+"),
        num = new RegExp("[0-9]+");
        
    if(pwd && pwd.length >= 8) {
        return pwd.toLowerCase() !== usr.local.email.toLowerCase() && ucase.test(pwd) && lcase.test(pwd) && num.test(pwd);
    }

    return false;
}
