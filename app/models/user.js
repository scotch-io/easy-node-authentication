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
        name         : String,
        expires_at   : String,
    },
    twitter          : {
        id           : String,
        token        : String,
        tokenSecret  : String,
        displayName  : String,
        username     : String
    },
    tumblr           : {
        token        : String,
        tokenSecret  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    renren           : {
        id           : String,
        token        : String,
        refreshToken : String,
        name         : String
    },
    weibo            : {
        id           : String,
        token        : String,
        username     : String,
        nickname     : String,
        expires_at   : String,
    }

});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
