'use strict';

// load configs
var config = require('./config');
if (!config) {
    console.log('Error loading configs!');
    process.exit(1);
}

// import dependencies
var express      = require('express'),
    mysql        = require('mysql'),
    http         = require('http'),
    path         = require('path');

// init express
var pbShare = express();

// setup the web server
pbShare.server = http.createServer(pbShare);

// init mysql
var dbMysql = mysql.createConnection({
    host     : config.mysql.host,
    port     : config.mysql.port,
    user     : config.mysql.username,
    password : config.mysql.password
});
dbMysql.connect();
dbMysql.query('use ' + config.mysql.database);
dbMysql.query('SET NAMES utf8mb4');

// config express in all environments
pbShare.configure(function() {
    // settings
    pbShare.disable('x-powered-by');
    pbShare.set('strict routing', true);

    // twitter settings
    pbShare.set('twitter-oauth-key', config.oauth.twitter.key);
    pbShare.set('twitter-oauth-secret', config.oauth.twitter.secret);

    // facebook settings
    pbShare.set('facebook-oauth-key', config.oauth.facebook.key);
    pbShare.set('facebook-oauth-secret', config.oauth.facebook.secret);

    // middleware
    pbShare.use(express.bodyParser());
    pbShare.use(express.favicon(__dirname + '/public/favicon.ico'));
    pbShare.use(express.static(path.join(__dirname, 'public')));
    pbShare.use(express.urlencoded());
    pbShare.use(express.json());
});

// define web routes
pbShare.get(/^(\/|\/home)$/, function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});
pbShare.post(/^(\/share)$/, function(req, res) {
    console.log(req);
    res.send('OK');
});

// define api routes
pbShare.post(/^\/api\/send\/?(.*)$/, function(req, res) {
    if (req.body
     && subscription.validateEmail(req.body.email)
     && subscription.validateUrl(req.body.url)) {
        subscription.subscribe(req.body.email, req.body.url, res);
    } else {
        res.send(400);
    }
});

// define 404 routes
pbShare.all('*', function(req, res) {
    res.redirect('http://www.pricebeater.ca:' + config.service_port + '/404');
});

// ON AIR!
pbShare.listen(config.service_port, function() {
    console.log('<<<<<<< PriceBeater-Share is now ON AIR! >>>>>>>');
});
