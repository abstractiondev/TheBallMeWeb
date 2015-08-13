(function() {
  'use strict';

  angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
  /*.controller('sidebarViewCtrl', function ($scope) {

  })*/.directive('tbSidebar', function() {
    return {
      templateUrl: function() {
        return './shared/sidebar/sidebarView.html';
      }
    };
  })
      .controller('Controller', ['$scope', function($scope) {
        $scope.customer = {
          name: 'Naomi',
          address: '1600 Amphitheatre'
        };
      }])
      .directive('myCustomer', function() {
        return {
          restrict: 'E',
          //template: 'Name: {{customer.name}} Address: {{customer.address}}'
          templateUrl: function () {
            return './app/shared/sidebar/sidebarView.html';

          }
        }
      })

    .config(config)
    .run(run)
  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }

})();
