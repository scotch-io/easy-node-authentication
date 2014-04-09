# Passport-Renren

copied and revised from passport-github

[Passport](http://passportjs.org/) strategy for authenticating with [Renren](https://renren.com/)
using the OAuth 2.0 API.

This module lets you authenticate using GitHub in your Node.js applications.
By plugging into Passport, GitHub authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-renren

## Usage

#### Configure Strategy

The GitHub authentication strategy authenticates users using a GitHub account
and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which accepts
these credentials and calls `done` providing a user, as well as `options`
specifying a client ID, client secret, and callback URL.

    passport.use(new GitHubStrategy({
        clientID: RENREN_CLIENT_ID,
        clientSecret: RENREN_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/renren/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ renrenId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'renren'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/renren',
      passport.authenticate('renren'));

    app.get('/auth/renren/callback', 
      passport.authenticate('renren', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/xinbenlv/passport-renren/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/xinbenlv/passport-renren.png)](http://travis-ci.org/xinbenlv/passport-renren)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)
  - [Zainan Victor Zhou](http://github.com/xinbenlv)
  

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Zainan Victor Zhou <[http://www.zzn.im/](http://www.zzn.im/)>

