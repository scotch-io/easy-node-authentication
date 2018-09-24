var express = require('express');
var path = require('path');

// app/routes.js
module.exports = function (app, passport) {

    // =====================================
    // SERVICEBOT WEBHOOK INTEGRATION ======
    // =====================================

    function generateJWT(email, key) {
        var crypto = require('crypto');
        var hmac = crypto.createHmac('sha256', key);

        var payload = {
            "email": email.toLowerCase()
        };
        var header = {
            "alg": "HS256",
            "typ": "JWT"
        };

        function cleanBase64(string) {
            console.log(string)
            return string.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
        }

        function base64encode(object) {
            return cleanBase64(Buffer.from(JSON.stringify(object)).toString("base64"));
        }

        var data = base64encode(header) + "." + base64encode(payload);
        hmac.update(data);
        return data + "." + cleanBase64(hmac.digest('base64'));
    }

    app.post("/servicebot-webhook", async function (req, res) {
        let User = require('./models/user');
        let eventData = req.body.event_data;
        let email, user;
        console.log(req.body.event_name);
        try {
            if (eventData.instance && eventData.instance.references) {
                email = eventData.instance.references.users[0].email;
                user = await User.findOne({'local.email': email});
            }
            switch (req.body.event_name) {
                // case "post_property_change":
                //     let properties = eventData.instance.references.service_instance_properties.reduce((acc, prop) => {
                //         acc[prop.name] = prop.data.value;
                //         return acc;
                //     }, {});
                //     user.tier = properties["tier"];
                //     user.business = properties["business-name"];
                //     await user.save();
                //     res.json({"message": "properties updated"});
                //     break;
                case "post_decommission":
                    if(user) {
                        user.status = "suspended";
                        await user.save();
                    }
                    res.json({"message": "user suspended"});
                    break;
                case "post_provision":
                    let instance = eventData.instance;
                    let userId = eventData.instance.user_id;
                    let tierId = instance.references.payment_structure_templates[0].tier_id
                    let newUser = new User();
                    newUser.status = "active";
                    newUser.accountType = "subscriber";
                    newUser.local.email = instance.references.users[0].email
                    newUser.tierId = tierId;
                    newUser.servicebotUid = userId;
                    // create the new user
                    await newUser.save();
                    res.json({"message": "new instance"});
                    break;
                case "post_seat_created":
                    let seat = eventData.seat;
                    console.log("new seat!", seat);
                    user = await User.findOne({'servicebotUid': seat.user_id});
                    if(user){
                        user.status = "active";
                        user.accountType = "seat";
                        user.tierId = null;
                        await user.save();
                    }else {
                        // let tierId = instance.references.payment_structure_templates[0].tier_id
                        let newUser = new User();
                        newUser.accountType = "seat";
                        newUser.status = "active";
                        newUser.local.email = seat.references.users[0].email
                        // newUser.tierId = tierId;
                        newUser.servicebotUid = seat.user_id;
                        // create the new user
                        await newUser.save();
                    }
                    res.json({"message": "seat created"});
                    break;
                case "post_seat_deleted":
                    let deletedSeat = eventData.seat;
                    user = await User.findOne({'servicebotUid': deletedSeat.user_id});
                    user.status = "suspended";
                    await user.save();
                    res.json({"message": "seat deleted"});
                    break;
                case "post_reactivate":
                    user.status = "active";
                    await user.save();
                    res.json({"message": "user reactivated"});
                    break;
                default:
                    res.json({"test": "test"});
                    break;
            }
        }catch(e){
            console.error(e);
            res.status(500).json({error: e});
        }
    });
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            servicebotUrl: process.env.SERVICEBOT_URL || "http://localhost:3000",
            message: req.flash('loginMessage')});
    });

    // process the login form
    app.post('/login', passport.authenticate('servicebot-login'));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {servicebotUrl: process.env.SERVICEBOT_URL || "http://localhost:3000", message: req.flash('signupMessage')});
    });
    app.get('/pricing', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('pricing.ejs', {
            servicebotUrl: process.env.SERVICEBOT_URL || "http://localhost:3000",
            message: req.flash('signupMessage')});
    });
    app.get('/features', function(req, res) {
        res.render('features.ejs', {
            message: req.flash('featuresMessage'),
            servicebotUrl: process.env.SERVICEBOT_URL || "http://localhost:3000"

        });
    });


    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function (req, res) {

        res.render('profile.ejs', {
            servicebotUrl: process.env.SERVICEBOT_URL || "http://localhost:3000",
            user: req.user, // get the user out of session and pass to template
        });
    });

    app.get('/billing', isLoggedIn, function (req, res) {

        //This is code generated from Servicebot


        var SECRET_KEY = process.env.SERVICEBOT_SECRET; //keep this key safe!
        var userToken = generateJWT(req.user.local.email, SECRET_KEY);


        res.render('billing.ejs', {
            user: req.user, // get the user out of session and pass to template
            userToken: userToken,
            servicebotUrl: process.env.SERVICEBOT_URL || "http://localhost:3000"
        });
    });
    app.get('/users', isLoggedIn, function (req, res) {

        //This is code generated from Servicebot


        var SECRET_KEY = process.env.SERVICEBOT_SECRET; //keep this key safe!
        var userToken = generateJWT(req.user.local.email, SECRET_KEY);


        res.render('users.ejs', {
            user: req.user, // get the user out of session and pass to template
            userToken: userToken,
            servicebotUrl: process.env.SERVICEBOT_URL || "http://localhost:3000"
        });
    });


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.use(express.static(path.join(__dirname, '../public')));


};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
