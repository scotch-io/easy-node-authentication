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