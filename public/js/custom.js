/*global jQuery, window, document*/
jQuery(document).ready(function ($) {
    'use strict';

    /*-------------------------------------
    Navbar Toggle for Mobile
    -------------------------------------*/
    function navbarCollapse() {
        if ($(window).width() < 992) {
            $(document).on('click', function (event) {
                var clickover = $(event.target);
                var is_opened = $("#navbar-collapse").hasClass("in");
                if (is_opened === true && !(clickover.is('.dropdown'))) {
                    $("button.navbar-toggle").trigger('click');
                }
            });

            $('.dropdown').unbind('click');
            $('.dropdown').on('click', function () {
                $(this).children('.dropdown-menu').slideToggle();
            });

            $('.dropdown *').on('click', function (e) {
                e.stopPropagation();
            });
        }
    }
    navbarCollapse();

    /*-----------------------------------------
    Magnific Popup
    -----------------------------------------*/
    $('.image-large').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });
    $('.play-video').magnificPopup({
        type: 'iframe'
    });
    $.extend(true, $.magnificPopup.defaults, {
        iframe: {
            patterns: {
                youtube: {
                    index: 'youtube.com/',
                    id: 'v=',
                    src: 'http://www.youtube.com/embed/%id%?autoplay=1'
                }
            }
        }
    });

    /*-------------------------------------
    Screenshot carousel
    -------------------------------------*/
    if ($('#screenshot-carousel-1').length > 0) {
        $('#screenshot-carousel-1').owlCarousel({
            items: 4,
            itemsDesktop: [1199, 4],
            itemsDesktopSmall: [991, 3],
            itemsTablet: [767, 3],
            itemsMobile: [479, 1],
            slideSpeed: 200,
            navigation: true,
            navigationText: ['<i class=\"fa fa-angle-left\"></i>', '<i class=\"fa fa-angle-right\"></i>'],
            pagination: false
        });
    }
    /*-----------------------------------------
    Mock slider-1
    -----------------------------------------*/
    if ($('#mock-slider-1').length > 0) {
        $('#mock-slider-1').owlCarousel({
            singleItem:true,
            slideSpeed: 1000,
            //autoPlay: 3000,
            stopOnHover: true,
            navigation: true,
            navigationText: ['<i class=\"fa fa-angle-left\"></i>', '<i class=\"fa fa-angle-right\"></i>'],
            pagination: false
        });
    }

    /*-----------------------------------------
    Screenshot carousel 2
    -----------------------------------------*/
    if ($('#screenshot-carousel-2').length > 0) {
        $('#screenshot-carousel-2').owlCarousel({
            singleItem:true,
            slideSpeed: 200,
            autoPlay: 3000,
            stopOnHover: true,
            navigation: true,
            navigationText: ['<i class=\"fa fa-angle-left\"></i>', '<i class=\"fa fa-angle-right\"></i>'],
            pagination: false
        });
    }

    /*-----------------------------------------
    testimonial carousel 1
    -----------------------------------------*/
    if ($('#testimonial-carousel').length > 0) {
        $('#testimonial-carousel').owlCarousel({
            singleItem:true,
            slideSpeed: 200,
            autoPlay: 3000,
            stopOnHover: true,
            navigation: false,
            pagination: true
        });
    }


    /*-------------------------------------
    Onepage Nav
    -------------------------------------*/
    $('.onepage-nav').each(function () {
        $(this).onePageNav();
    });

    /*-------------------------------------
    Count To
    -------------------------------------*/
    function animateCountTo(ct) {
        if ($.fn.visible && $(ct).visible() && !$(ct).hasClass('animated')) {
            $(ct).countTo({
                speed: 2000
            });
            $(ct).addClass('animated');
        }
    }

    function initCountTo() {
        var counter = $('.count');
        counter.each(function () {
            animateCountTo(this);
        });
    }

    initCountTo();

    /*-----------------------------------------------------
    Banner Slider 2
    ------------------------------------------------------*/
    $('.testimonial-slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        fade: true,
        asNavFor: '.testimonial-banner-slider'
    });
    $('.testimonial-banner-slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.testimonial-slider',
        arrows: false,
        focusOnSelect: true,
        autoplay: true,
        autoplaySpeed: 2000
    });

    /*-----------------------------------------------------
    Countdown 
    ------------------------------------------------------*/
    $('.countdown').each(function () {
        var endTime = $(this).data('time');
        $(this).countdown(endTime, function (tm) {
            var countTxt = '';
            countTxt += '<span class="section_count"><span class="section_count_data"><span class="count-data"><span class="tcount days">%D </span><span class="text">Days</span></span></span></span>';
            countTxt += '<span class="section_count"><span class="section_count_data"><span class="count-data"><span class="tcount hours">%H</span><span class="text">Hours</span></span></span></span>';
            countTxt += '<span class="section_count"><span class="section_count_data"><span class="count-data"><span class="tcount minutes">%M</span><span class="text">Minutes</span></span></span></span>';
            countTxt += '<span class="section_count"><span class="section_count_data"><span class="count-data"><span class="tcount seconds">%S</span><span class="text">Seconds</span></span></span></span>';

            $(this).html(tm.strftime(countTxt));
        });
    });
    /*-----------------------------------
       Contact Form
       -----------------------------------*/
    // Function for email address validation
    function isValidEmail(emailAddress) {
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

        return pattern.test(emailAddress);

    }
    $("#contactForm").on('submit', function (e) {
        e.preventDefault();
        var data = {
            name: $("#name").val(),
            email: $("#email").val(),
            message: $("#message").val()
        };

        if (isValidEmail(data['email']) && (data['message'].length > 1) && (data['name'].length > 1) && (data['phone'].length > 1)) {
            $.ajax({
                type: "POST",
                url: "sendmail.php",
                data: data,
                success: function () {
                    $('#contactForm .input-success').delay(500).fadeIn(1000);
                    $('#contactForm .input-error').fadeOut(500);
                }
            });
        } else {
            $('#contactForm .input-error').delay(500).fadeIn(1000);
            $('#contactForm .input-success').fadeOut(500);
        }

        return false;
    });

    /*-----------------------------------
    Subscription
    -----------------------------------*/
    $(".subscription").ajaxChimp({
        callback: mailchimpResponse,
        url: "http://codepassenger.us10.list-manage.com/subscribe/post?u=6b2e008d85f125cf2eb2b40e9&id=6083876991" // Replace your mailchimp post url inside double quote "".  
    });

    function mailchimpResponse(resp) {
        if (resp.result === 'success') {

            $('.newsletter-success').html(resp.msg).fadeIn().delay(3000).fadeOut();

        } else if (resp.result === 'error') {
            $('.newsletter-error').html(resp.msg).fadeIn().delay(3000).fadeOut();
        }
    }
    
    // Full viewport height
    function fullHeight(){
        $('.full-vh').each(function(){
            $(this).css('height', $(window).height());
        })
    }
    
    fullHeight();

    $(window).on('resize orientationchange', function () {
        navbarCollapse();
        fullHeight();
    });

    $(window).on('scroll', function(){
        initCountTo();
    });
});
