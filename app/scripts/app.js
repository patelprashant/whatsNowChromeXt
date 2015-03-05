'use strict';
/**
 *  Module
 *
 * Description*/
angular.module('myNowApp', ['ngRoute', 'ngMaterial'])
    .config(function(WeatherProvider, $routeProvider, $mdThemingProvider) {
        WeatherProvider.setApiKey('fefcdf0b70f292d9');

        $routeProvider
            .when('/', {
                templateUrl: 'templates/main.html',
                controller: 'MainCtrl'
            })
            .when('/settings', {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
        $mdThemingProvider.definePalette('amazingPaletteName', {
            '50': 'ffebee',
            '100': 'ffcdd2',
            '200': 'ef9a9a',
            '300': 'e57373',
            '400': 'ef5350',
            '500': 'f44336',
            '600': 'e53935',
            '700': 'd32f2f',
            '800': 'c62828',
            '900': 'b71c1c',
            'A100': 'ff8a80',
            'A200': 'ff5252',
            'A400': 'ff1744',
            'A700': 'd50000',
            'contrastDefaultColor': 'light', // whether, by default, text (contrast)
            // on this palette should be dark or light
            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                '200', '300', '400', 'A100'
            ],
            'contrastLightColors': undefined // could also specify this if default was 'dark'
        });
        $mdThemingProvider.theme('default')
            .primaryPalette('amazingPaletteName')
    })
    .controller('MainCtrl', function($scope, $timeout, Weather, UserService) {
        // Build the date object
        $scope.date = {};
        $scope.weather = {};
        $scope.user = UserService.user;

        // Update function
        var updateTime = function() {
            $scope.date.raw = new Date();
            $timeout(updateTime, 1000);
        }

        // Kick off the update function
        updateTime();

        Weather.getWeatherForecast($scope.user.location)
            .then(function(data) {
                $scope.weather.forecast = data;
                // console.log(data);
            });

    })
    .controller('SettingsCtrl', function($scope, UserService) {
        $scope.user = UserService.user;

        $scope.save = function() {
            UserService.save();

        }
    })
    .provider('Weather', function() {
        var apiKey = '';

        this.setApiKey = function(key) {
            if (key) this.apiKey = key;
        };

        this.getUrl = function(type, ext) {
            var url = 'http://api.wunderground.com/api/' + this.apiKey + '/' + type + '/q/' + ext + '.json';
            // console.log(url);
            return url;
        }

        this.$get = function($q, $http) {
            var self = this;
            return {
                // Service Object
                getWeatherForecast: function(city) {
                    var d = $q.defer();

                    $http({
                        method: 'GET',
                        url: self.getUrl('forecast', city),
                        cache: true
                    }).success(function(data) {
                        d.resolve(data.forecast.simpleforecast);
                    }).error(function(err) {
                        d.reject(err);
                    });

                    return d.promise;

                }
            }
        }
    })
    .factory('UserService', function() {
        var defaults = {
            location: 'autoip'
        };
        var service = {
            user: {},
            save: function() {
                sessionStorage.whatsnow = angular.toJson(service.user);
            },
            restore: function() {
                service.user = angular.fromJson(sessionStorage.whatsnow) || defaults;
                console.log('service user' + service.user);

                return service.user;
            }

        };

        service.restore();
        return service;
    });
