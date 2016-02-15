var User = require('../app/models/user');
var Question = require('../app/models/question');

module.exports = function (app, passport) {
    app.get('/', function (req, res) {
        res.render('index');
    });


    //==================================================================
    //==================================================================
    // ADMIN part=======================================================
    //==================================================================
    //==================================================================


    // addadmin SECTION =========================
    app.get('/addadmin', isLoggedIn, function (req, res) {
        res.render('addadmin.ejs', {
            user: req.user
        });
    });

    // removeadmin SECTION =========================
    app.get('/removeadmin', isLoggedIn, function (req, res) {
        res.render('removeadmin.ejs', {
            user: req.user
        });
    });

    // addnewquestion SECTION =========================
    app.get('/addnewquestion', isLoggedIn, function (req, res) {
        res.render('addnewquestion.ejs', {
            user: req.user
        });
    });

    // addnewquestion SECTION =========================
    app.post('/addnewquestion', function (req, res) {
        var newQuestion = new Question(req.body);
        console.log(req.body);

        newQuestion.save(function (err, data) {
            if (err) {
                console.log(err);
            } else {
                return res.redirect('/addnewquestion');
            }
        });
    });

    // Admin check true ====================
    app.post('/update', function (req, res) {
        console.log(req.body);

        User.findByIdAndUpdate({
            _id: req.body.id
        }, {
            isadmin: true
        }, function (err, user) {
            if (err) {
                return (err);
            } else {
                res.json(user);
            }
        });
    });

    // Admin check false =====================
    app.post('/notadmin', function (req, res) {
        console.log(req.body);

        User.findByIdAndUpdate({
            _id: req.body.id
        }, {
            isadmin: false
        }, function (err, user) {
            if (err) {
                return (err);
            } else {
                res.json(user);
            }
        });
    });


    // showall user/admin SECTION =========================
    app.get('/showalluser', function (req, res) {
        User.find(function (err, data) {
            if (err) {
                console.log(err);
            } else {
                res.send(data);
            }
        });
    });


    // Dashboard SECTION =========================
    app.get('/dashboard', isLoggedIn, function (req, res) {
        console.log(req.user);

        if (req.user.isadmin) {
            res.render('dashboardadmin');
        } else {
            res.render('dashboardstudent');
        }
    });


    // showallquestion SECTION =========================
    app.get('/showallquestion', function (req, res) {
        Question.find({}, function (err, data) {
            res.send(data);
        });
    });




    // removequestion get=====================
    app.get('/removequestion', isLoggedIn, function (req, res) {
        res.render('removequestion.ejs', {
            user: req.user
        });
    });


    // removequestion post=====================
    app.post('/removequestion', function (req, res) {
        console.log(req.body);

        Question.findByIdAndRemove({
                _id: req.body.id
            }, {

            },
            function (err, question) {
                if (err) {
                    console.log("Error");
                    return res.redirect('/removequestion?error=deleting');
                } else {
                    console.log("Delete Question Successfully");
                }
            });
    });


    //    Model.findByIdAndRemove = function (id, options, callback) {
    //        if (1 === arguments.length && 'function' == typeof id) {
    //            var msg = 'Model.findByIdAndRemove(): First argument must not be a function.\n\n' + '  ' + this.modelName + '.findByIdAndRemove(id, callback)\n' + '  ' + this.modelName + '.findByIdAndRemove(id)\n' + '  ' + this.modelName + '.findByIdAndRemove()\n';
    //            throw new TypeError(msg);
    //        }
    //
    //        return this.findOneAndRemove({
    //            _id: id
    //        }, options, callback);
    //    };





    // showall question SECTION =========================
    //    app.get('/showallquestion', function (req, res) {
    //        Question.find(function (err, data) {
    //            if (err) {
    //                console.log(err);
    //            } else {
    //                res.send(data);
    //            }
    //        });
    //    });



    //==================================================================
    //==================================================================
    // USER PART=======================================================
    //==================================================================
    //==================================================================




    // randomly option will show routes SECTION =========================
    app.get('/getarandom', function (req, res) {
        Question.find(function (err, data) {
            if (err) {
                console.log(err);
            } else {
                //                res.json(data.length);
                var randomNum = Math.floor(Math.random() * data.length) + 1;
                res.json(data[randomNum]);
            }
        });
    });



    // practises SECTION =========================
    //    app.get('/question', isLoggedIn, function (req, res) {
    //        res.render('question.ejs', {
    //            user: req.user
    //        });
    //    });




    // profile SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user
        });
    });


    // examstart SECTION =========================
    app.get('/examstart', isLoggedIn, function (req, res) {
        res.render('examstart.ejs', {
            user: req.user
        });
    });

    // examrecords SECTION =========================
    app.get('/examrecords', isLoggedIn, function (req, res) {
        res.render('examrecords.ejs', {
            user: req.user
        });
    });

    // reports SECTION =========================
    app.get('/reports', isLoggedIn, function (req, res) {
        res.render('reports.ejs', {
            user: req.user
        });
    });

    // aboutus SECTION =========================
    app.get('/aboutus', isLoggedIn, function (req, res) {
        res.render('aboutus.ejs', {
            user: req.user
        });
    });



    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        console.log("user logout successfully");
        res.redirect('/');
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/login', function (req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/dashboard', // redirect to the secure dashboard section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', {
            message: req.flash('signupMessage')
        });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/dashboard', // redirect to the secure dashboard section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: 'email'
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', {
        scope: 'email'
    }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['dashboard', 'email']
    }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
    app.get('/connect/local', function (req, res) {
        res.render('connect-local.ejs', {
            message: req.flash('loginMessage')
        });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/dashboard', // redirect to the secure dashboard section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', {
        scope: 'email'
    }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', {
        scope: 'email'
    }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', {
        scope: ['dashboard', 'email']
    }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function (req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function (req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function (req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function (req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
        });
    });


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
