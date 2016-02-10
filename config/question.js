var User = require('../app/models/question');

var configAuth = require('./auth');


module.exports = function (passport) {

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });



//    passport.use('question', new LocalStrategy({
//            usernameField: 'email',
//            passwordField: 'password',
//            passReqToCallback: true
//        },
//        function (req, name, done) {
//
//            // asynchronous
//            process.nextTick(function () {
//                // if the user is not already logged in:
//                if (!req.user) {
//                    User.findOne({
//                        'local.email': email
//                    }, function (err, user) {
//                        // if there are any errors, return the error
//                        if (err)
//                            return done(err);
//                        else {
//                            // create the user
//                            var newQuedtion = new User();
//
//                            newQuedtion.question.type = Question;
//
//                            newQuedtion.save(function (err) {
//                                if (err)
//                                    return done(err);
//
//                                return done(null, newQuedtion);
//                            });
//                            console.log("user saved" + newQuedtion);
//                        }
//
//                    });
//                };
//            });
//        };
//    ));

    //        passport.use('question', new LocalStrategy({
                            usernameField: 'email',
    //                        passwordField: 'password',
    //                        passReqToCallback: true
    //                    },
    //                    function (req, name, done) {
    //
    //                        // asynchronous
    //                        process.nextTick(function (err, question) {
    //
    //                            if (err)
    //                                return done(err);
    //
    //                            else {
    //                                // create the question
    //                                var newQuedtion = new Question();
    //
    //                                newQuedtion.question.name = String;
    //
    //                                newQuedtion.save(function (err) {
    //                                    if (err)
    //                                        return done(err);
    //
    //                                    return done(null, newQuedtion);
    //                                });
    //                                console.log("Question saved" + newQuedtion);
    //                            }
    //                        });
    //                    }
};
