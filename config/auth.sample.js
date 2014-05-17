// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID' 		 : 'your-secret-clientID-here', // your App ID
		'clientSecret' 	 : 'your-client-secret-here', // your App Secret
		'callbackURL'    : 'http://localhost:8030/auth/facebook/callback'
        'expire'         : 60 * 60 * 24 * 60
    },

    'twitterAuth' : {
        'consumerKey' 	 : 'your-consumer-key-here',
		'consumerSecret' : 'your-client-secret-here',
		'callbackURL' 	 : 'http://localhost:8030/auth/twitter/callback'
    },

    'tumblrAuth' : {
        'consumerKey'    : 'your-consumer-key-here',
        'consumerSecret' : 'your-secret-key-here',
        'callbackURL'    : 'http://localhost:8030/auth/tumblr/callback'
    },

    'googleAuth' : {
        'clientID' 		 : 'your-secret-clientID-here',
		'clientSecret' 	 : 'your-client-secret-here',
		'callbackURL' 	 : 'http://localhost:8030/auth/google/callback'
    },

    'renrenAuth' : {
        'clientID'       : 'your-secret-clientID-here', // your App ID
        'clientSecret'   : 'your-client-secret-here', // your App Secret
        'callbackURL'    : 'http://localhost:8030/auth/renren/callback'
    },

    'weiboAuth' : {
        'clientID'       : 'your-secret-clientID-here',
        'clientSecret'   : 'your-client-secret-here',
        'callbackURL'    : 'http://localhost:8030/auth/weibo/callback'
        'expire'         : 60 * 60 * 24 * 1
    },

    'awsAuth' : {
        'bucket'         : 'type-bucket-here',
        'acl'            : 'public-read'
    }

};
