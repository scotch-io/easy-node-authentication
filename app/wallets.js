module.exports = function()
{
    return {
        getUserWallets: function(userId, success, error) {
            redisClient.lrange(config.coin + ':auth:users:' + userId + ':wallets', 0, -1, function(err, res) {
                if (err) {
                    log('error', 'Unable to get user\'s (%s) wallets: %s', [userId, err.toString()]);
                    error(err);
                    return;
                }
                success(res ? res : []);
            });
        },

        removeWallet: function(address, userId, success, error) {
            
            var walletKey = config.coin + ':auth:wallets:' + address + ":users", 
                userKey = config.coin + ':auth:users:' + userId + ":wallets",
                multi = redisClient.multi();

            multi.lrem(walletKey, 0, userId);
            multi.lrem(userKey, 0, address);
            multi.lrange(walletKey, 0, -1);
            
            multi.exec(function(err, replies){
                
                if (err) {
                    log('error', 'Unable to delete user (%s) from wallet %s: %s', [userId, address, err.toString()]);
                    error(err);
                    return;
                }

                if(replies[2].length === 0) {
                    redisClient.del(walletKey, function(err){
                        if(err) {
                            log('error', 'Unable to delete wallet %s: %s', [address, err.toString()]);
                            error(err);
                            return;
                        }
                        success();
                    });
                } else{
                    success();
                }
            });
        },

        addWallet: function(address, userId, success, error) {
            var walletKey = config.coin + ':auth:wallets:' + address + ":users", 
            userKey = config.coin + ':auth:users:' + userId + ":wallets";
            
            function addToWallets()
            {
                redisClient.lrange(walletKey, 0, -1, function(err, res){
                    try{
                        res.forEach(function(item) {
                            if(item === userId) {
                                throw new Error("break");
                            }
                        });
    
                        redisClient.rpush(walletKey, userId, function(err, res){
                            if(err) {
                                log('error', 'Unable to add user %s to wallet %s: %s', [userId, address, err.toString()]);
                                error(err);
                                return;                            
                            } else {
                                success();
                            }
                        });
                    } catch(e){
                        if(e.message !== "break") {
                            throw e;
                        }
                        success(); // user already present on the wallet
                    }
                });
            }

            // add wallet to users
            redisClient.lrange(userKey, 0, -1, function(err, res){
                try{
                    res.forEach(function(item) {
                        if(item === address) {
                            throw new Error("break");
                        }
                    });

                    redisClient.rpush(userKey, address, function(err, result){
                        if(err) {
                            log('error', 'Unable to add wallet %s to user %s: %s', [address, userId, err.toString()]);
                            error(err);
                            return;                            
                        }
                        addToWallets();
                    });

                } catch(e){
                    if(e.message !== "break") {
                        throw e;
                    }
                    addToWallets();
                }
            });
        }
    };
};