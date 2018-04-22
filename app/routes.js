// app/routes.js
module.exports = function (app, passport) {

    // =====================================
    // SERVICEBOT WEBHOOK INTEGRATION ======
    // =====================================
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
                case "post_property_change":
                    let properties = eventData.instance.references.service_instance_properties.reduce((acc, prop) => {
                        acc[prop.name] = prop.data.value;
                        return acc;
                    }, {});
                    user.tier = properties["tier"];
                    user.business = properties["business-name"];
                    await user.save();
                    res.json({"message": "properties updated"});
                    break;
                case "post_decommission":
                    await user.save();
                    res.json({"message": "user suspended"});
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
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {
        let tier = req.query.tier || "Basic";
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {servicebotUrl: process.env.SERVICEBOT_URL || "http://localhost:3000", tier, message: req.flash('signupMessage')});
    });
    app.get('/pricing', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('pricing.ejs', {message: req.flash('signupMessage')});
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
        function generateJWT(email, key) {
            var crypto = require('crypto');
            var hmac = crypto.createHmac('sha256', key);

            var payload = {
                "email": email
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

        var SECRET_KEY = process.env.SERVICEBOT_SECRET || "a110fc299852d2dc00326fbe8e98a977ad019f79783b5302d95accc8c32f6a5f"; //keep this key safe!
        var userToken = generateJWT(req.user.local.email, SECRET_KEY);


        res.render('billing.ejs', {
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
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
