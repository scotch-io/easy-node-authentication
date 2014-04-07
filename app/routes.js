module.exports = function(app, passport) {

// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	// SHARE SECTION =========================
	app.get('/share', isLoggedIn, function(req, res) {
		res.render('share.ejs', {
			user : req.user
		});
	});
	app.post('/share', isLoggedIn, function(req, res) {
		console.log(req);

		// var FB = require('fb');
		// FB.setAccessToken(req.user.facebook.token);

		// var body = 'My first post using facebook-node-sdk';
		// FB.api('me/feed', 'post', { message: body}, function (res) {
		//   if(!res || res.error) {
		//     console.log(!res ? 'error occurred' : res.error);
		//     return;
		//   }
		//   console.log('Post Id: ' + res.id);
		// });


		// var twitterAPI = require('node-twitter-api');
		// var twitter = new twitterAPI({
		//     consumerKey: '***********************',
		//     consumerSecret: '******************************',
		//     callback: '*********************************'
		// });

		// twitter.statuses("update", {
		//         status: "Hello world!"
		//     },
		//     req.user.twitter.token,
		//     req.user.twitter.tokenSecret,
		//     function(error, data, response) {
		//         if (error) {
		//             console.log('something went wrong');
		//         } else {
		//             // data contains the data sent by twitter
		//             consolg.log('ok');
		//         }
		//     }
		// );

		// pinterest
		// http://www.nextscripts.com/pinterest-automated-posting/

		// var request = require('request');

		// request.post(
  //           'https://api.renren.com/v2/feed/put',
  //           {form: {
  //           	access_token: req.user.renren.token,
  //           	message: 'Hello from renren SDK!',
  //           	title: '123123',
  //           	description: '1231',
  //           	targetUrl: 'http://www.leaskh.com'
  //          	}},
  //           function (error, response, body) {

  //           }
  //       );




	});

	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
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
			successRedirect : '/share', // redirect to the secure share section
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
			successRedirect : '/share', // redirect to the secure share section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email', 'read_stream', 'publish_actions'] }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : '/share',
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

		// handle the callback after twitter has authenticated the user
		app.get('/auth/twitter/callback',
			passport.authenticate('twitter', {
				successRedirect : '/share',
				failureRedirect : '/'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/auth/google', passport.authenticate('google', { scope : ['share', 'email'] }));

		// the callback after google has authenticated the user
		app.get('/auth/google/callback',
			passport.authenticate('google', {
				successRedirect : '/share',
				failureRedirect : '/'
			}));


	// renren ---------------------------------

		// send to renren to do the authentication
		app.get('/auth/renren', passport.authenticate('renren', {}));

		// the callback after renren has authenticated the user
		app.get('/auth/renren/callback',
			passport.authenticate('renren', {
				successRedirect : '/share',
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
			successRedirect : '/profile', // redirect to the secure share section
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
		app.get('/connect/google', passport.authorize('google', { scope : ['share', 'email'] }));

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

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
