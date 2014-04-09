'use strict';

// main.js

// set up ======================================================================
// get all the tools we need
var express  = require('express'),
    app      = express(),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash    = require('connect-flash'),
    path     = require('path');

// configuration ===============================================================
var config   = require('./config/server.js'),
    configDB = require('./config/database.js');
if (!config || !configDB) {
    console.log('Error loading configs!');
    process.exit(1);
}
var port     = config.port;
mongoose.connect(configDB.url); // connect to our database
require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {
    // settings
    app.disable('x-powered-by');
    app.set('strict routing', true);
    app.use(express.favicon(__dirname + '/public/favicon.ico'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.urlencoded());
    app.use(express.json());

    // set up our express application
    app.use(express.logger('dev')); // log every request to the console
    app.use(express.cookieParser()); // read cookies (needed for auth)
    app.use(express.bodyParser({
        keepExtensions: true,
        uploadDir: __dirname + '/uploads'
    })); // get information from html forms
    app.use(express.methodOverride());

    // set up ejs for templating
    app.set('view engine', 'ejs');

	// required for passport
	app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session
});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
// 404
app.all('*', function(req, res) {
    res.redirect('/404');
});

// ON AIR! =====================================================================
app.listen(port, function() {
    console.log('<<<<<<< PriceBeater-Share is now ON AIR! >>>>>>>');
});
