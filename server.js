// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var redis        = require('redis');

require('./app/configReader.js');
config.redis.host = process.env.redisHost || config.redis.host;
config.redis.port = process.env.redisPort || config.redis.port;
config.redis.auth = process.env.redisAuth || config.redis.auth;

// configuration ===============================================================
mongoose.connect(process.env.rustyDbUrl, { useMongoClient: true }); // connect to our database

global.redisClient = redis.createClient(config.redis.port, config.redis.host);

require('./config/passport')(passport); // pass passport for configuration

global.logSystem = 'poolweb';
require('./app/logger.js');
require('./app/exceptionWriter.js')();

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: process.env.rustySessionSecret, // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// custom static content integration
app.use("/pages", express.static('static/pages'))
app.use("/", express.static('static'))

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(port);
console.log('The magic happens on port ' + port);
