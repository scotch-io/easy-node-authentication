// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// checking if password is valid using bcrypt
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


// we will use .pre to hash our password before saving our user
// we don't have to manually create our hash
// we are hashing asynchronously so we are not blocking our application when multiple people are signing up
userSchema.pre('save', function(next) {
    var user = this;

    // hash the password
    bcrypt.hash(user.local.password, null, null, function(err, hash) {
        if (err)
            return next(err);

        console.log(user.local.password);
        console.log(hash);

        user.local.password = hash;
        next();
    });

});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);