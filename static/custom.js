var captchaWidget;
function onLoadCaptcha() {
    captchaWidget = grecaptcha.render('captchaId', {
        'sitekey' : '6LdzjD0UAAAAAN2bTgOUP-eGIVnLsx-RhPgetsFu',
        'callback' : onSubmit, 
    });
}

function onSubmit() {
    document.forms[0].submit();
}

function validateCredentials(event) {
    event.preventDefault();
    if(formValid(event)){
        grecaptcha.execute(captchaWidget);
    }
}

function createCookie(name,value,days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    document.cookie = name+"="+value+expires+"; path=/";      
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;        
}
