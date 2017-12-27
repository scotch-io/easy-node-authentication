module.exports = function()
{
    var User = require('../app/models/user');
    var wallets = require('./wallets')();

    return {
        changePassword: function(req, res, done) {
            if(req.body.password1 !== req.body.password2 || !isValidPassword(req.body.password1, req.user)) {
                req.flash('profileMessage', req.body.password1 !== req.body.password2 ? "Passwords do not match" : 
                    "Incorrect password. Expected minimum 8 characters including 1 upper case letter, 1 lower case letter and 1 number. Password should not be the same as user name.");
                res.redirect('/#profile');
                return;
            }
            
            User.findOne({ 'local.email' :  req.user.local.email }, function(err, user) {
                // if there are any errors, return the error
                if (err){
                    log('warn', logSystem, 'Failed to find user %s: %s', [req.user.local.email, err.toString()]);
                    return done(err);
                }

                // if no user is found, return the message
                if (!user) {
                    log('warn', logSystem, 'User not found for password change: %s', [req.user.local.email]);
                    return done(null, false);
                }

                user.local.password = user.generateHash(req.body.password1);

                user.save(function(err) {
                    if (err) {
                        log('error', logSystem, 'Failed to save password for user %s : %s', [req.user.local.email, err.toString()]);
                        return done(err);
                    }
                    log('info', logSystem, 'Password changed for user %s', [req.user.local.email]);
                    res.send('Ok');
                });
            });
        },

        saveWallets: function(req, res, done) {
            User.findOne({ 'local.email' :  req.user.local.email }, function(err, user) {
                var currentWallets = [];
                // if there are any errors, return the error
                if (err) {
                    log('warn', logSystem, 'Failed to find user %s: %s', [req.user.local.email, err.toString()]);
                    return done(err);
                }

                // if no user is found, return the message
                if (!user) {
                    log('warn', logSystem, 'User not found for wallets update: %s', [req.user.local.email]);
                    return done(null, false);
                }
                
                wallets.getUserWallets(user.id, function(currentWallets) {
                    var removed = [], added = [], countProcessed;

                    // determine added and removed wallets
                    currentWallets.forEach(function(item){
                        if (req.body.wallets.indexOf(item) === -1) {
                            removed.push(item);
                        }
                    });
                    req.body.wallets.forEach(function (item) {
                        item = item.trim();
                        if(item === "") { // skip empty lines
                            return;
                        }
                        if (currentWallets.indexOf(item) === -1) {
                            added.push(item);
                        }
                    });
                    
                    function processAdded()
                    {
                        if(added.length === 0) {
                            res.send("Ok");
                            return;
                        }
                        countProcessed = 0;
                        added.forEach(function(item) {
                            var newWalletId;
                            wallets.addWallet(item, user.id, function() {
                                countProcessed++
                                log('info', logSystem, 'Added wallet %s for user %s (%s)', [item, user.id, req.user.local.email]);
                                if(countProcessed === added.length){
                                    res.send("Ok");
                                }
                            }, function(err){
                                throw new Error(JSON.stringify(err));
                            });
                        });
                    }

                    countProcessed = 0;
                    try{
                        if(removed.length === 0) {
                            processAdded();
                        } else {
                            removed.forEach(function(item){
                                wallets.removeWallet(item, user.id, function(){
                                    countProcessed++;
                                    log('info', logSystem, 'Removed wallet %s for user %s', [item, req.user.local.email]);

                                    if(countProcessed === removed.length) {
                                        processAdded();
                                    }
                                }, function(err){
                                    throw new Error(JSON.stringify(err));
                                });
                            });
                        }
                    } catch(e) {
                        return done(JSON.parse(e.message));
                    }
                }, function(err) {
                    return done(err);
                });
            });            
        }
    };

    function isValidPassword(pwd, usr){
        var ucase = new RegExp("[A-Z]+"),
            lcase = new RegExp("[a-z]+"),
            num = new RegExp("[0-9]+");
            
        if(pwd && pwd.length >= 8) {
            return pwd.toLowerCase() !== usr.local.email.toLowerCase() && ucase.test(pwd) && lcase.test(pwd) && num.test(pwd);
        }
    
        return false;
    };    
};