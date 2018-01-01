module.exports = function(success, failure)
{
    var s = success, f = failure;

    return function(req, res, next) {
        if(req.body["g-recaptcha-response"]){

            var request = require('request');
    
            request.post({
                url: 'https://www.google.com/recaptcha/api/siteverify',
                form: {
                    response: req.body["g-recaptcha-response"],
                    secret: process.env.rustyReCaptchaKey,
                    remoteip: req.headers['X-Forwarded-For'] || 
                        req.connection.remoteAddress
                }
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    body = JSON.parse(body);
                    if(body.success){
                        s(req, res, next);
                    } else {
                        f(req, res, next, "reCAPTCHA code is incorrect");    
                    }
                } else {
                    console.error("reCaptcha validation failed, status: " + response.statusCode + ", error: " + error);
                    f(req, res, next, "Failed to validate reCAPTCHA");
                }
            });
        } else {
            f(req, res, next, "reCAPTCHA data is not present in request");
        }
    };
}