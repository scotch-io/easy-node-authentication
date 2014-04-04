//

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/gm, '');
    };
}

var storage = {
    get : function(key) {
        if (typeof window.localStorage !== 'undefined') {
            var _value = window.localStorage.getItem(key);
            return _value ? JSON.parse(_value) : null;
        } else {
            return null;
        }
    },
    set : function(key, value) {
        if (typeof window.localStorage !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(value));
            return true;
        } else {
            return false;
        }
    }
};

var validateUrl = function(url) {
    // http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
    var pattern = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    return pattern.test(url);
};

var pbShare = angular.module('pbShare', ['ngRoute']);
pbShare.config([
    '$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/', {
            controller: CtlHome,
            templateUrl: '/templates/home.html'
        }).otherwise({
            redirectTo: '/'
        });
    }
]);

var CtlHome = function($scope) {
    $scope.share = function() {

    }
};
