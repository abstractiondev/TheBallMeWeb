var appModule;

(function() {
  'use strict';

  appModule = angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations',

    // 3rd party
    'angular-promise-cache',
    'mm.foundation',
  ])
    .config(config)
    .constant("_", window._)
    .run(run)
  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider', '$controllerProvider'];

  function config($urlProvider, $locationProvider, $controllerProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
  }

  function run($rootScope) {
    $rootScope._ = window._;
    FastClick.attach(document.body);
  }

})();

/// <reference path="../../typings/angularjs/angular.d.ts" />
var application;
(function (application) {
    var AccountService = (function () {
        function AccountService($http, $location, promiseCache) {
            this.$http = $http;
            this.promiseCache = promiseCache;
        }
        AccountService.prototype.getAccountData = function () {
            var me = this;
            return this.promiseCache({
                promise: function () {
                    return me.$http.get('../../AaltoGlobalImpact.OIP/AccountContainer/default.json');
                }
            });
        };
        return AccountService;
    })();
    application.AccountService = AccountService;
    window.appModule.factory('AccountService', ["$http", "$location", "promiseCache",
        function ($http, $location, promiseCache) { return new AccountService($http, $location, promiseCache); }]);
})(application || (application = {}));

/**
 * Created by Kalle on 7.9.2015.
 */
/// <reference path="../../typings/angularjs/angular.d.ts" />
var application;
(function (application) {
    var OperationService = (function () {
        function OperationService($http, $location, $q, $timeout, promiseCache) {
            this.$http = $http;
            this.$location = $location;
            this.$q = $q;
            this.$timeout = $timeout;
            this.promiseCache = promiseCache;
        }
        OperationService.SuccessPendingOperation = function (operationID, successParamsString) {
            var deferredData = OperationService.pendingOperations[operationID];
            var deferred = deferredData.deferred;
            //deferredData.serviceInstance.blockUI.stop();
            var wnd = window;
            var successParams = null;
            if (successParamsString)
                successParams = JSON.parse(successParamsString);
            deferred.resolve(successParams);
            delete OperationService.pendingOperations[operationID];
        };
        OperationService.FailPendingOperation = function (operationID, failParamsString) {
            var deferredData = OperationService.pendingOperations[operationID];
            var deferred = deferredData.deferred;
            var wnd = window;
            wnd.$.unblockUI();
            var failParams = JSON.parse(failParamsString);
            deferred.reject(failParams);
            //deferredData.serviceInstance.blockUI.stop();
            delete OperationService.pendingOperations[operationID];
        };
        OperationService.ProgressPendingOperation = function (operationID, progressParamsString) {
            var deferredData = OperationService.pendingOperations[operationID];
            var deferred = deferredData.deferred;
            //var progressParams = JSON.parse(progressParamsString);
            var progressParams = { progress: parseFloat(progressParamsString) };
            deferred.notify(progressParams);
        };
        OperationService.prototype.executeOperation = function (operationName, operationParams) {
            var me = this;
            var wnd = window;
            var simulateServiceProgress = me.$location.protocol() == "http" && me.$location.host() == "localhost";
            if (wnd.TBJS2MobileBridge) {
                var stringParams = JSON.stringify(operationParams);
                var result = wnd.TBJS2MobileBridge.ExecuteAjaxOperation(operationName, stringParams);
                var resultObj = JSON.parse(result);
                var operationID = resultObj.OperationResult;
                //var success =
                var deferred = me.$q.defer();
                OperationService.pendingOperations[operationID] = { deferred: deferred, serviceInstance: me };
                return deferred.promise;
            }
            else if (!simulateServiceProgress) {
                var deferred = me.$q.defer();
                me.$http.post("https://tbvirtualhost/op/" + operationName, operationParams).then(function (response) {
                    var resultObj = JSON.parse(response.data);
                    var operationID = resultObj.OperationResult;
                    OperationService.pendingOperations[operationID] = { deferred: deferred, serviceInstance: me };
                });
                return deferred.promise;
            }
            else {
                var deferred = me.$q.defer();
                var progressCurrent = 0;
                var progressSimulation = function () {
                    progressCurrent += 5;
                    if (progressCurrent >= 100) {
                        deferred.resolve();
                    }
                    else {
                        deferred.notify({ progress: progressCurrent / 100, statusMessage: "Proceeding: " + progressCurrent });
                        me.$timeout(progressSimulation, 200);
                    }
                    //else
                    //  me.foundationApi.publish("progressBarModal", "close");
                };
                me.$timeout(progressSimulation, 200);
                return deferred.promise;
            }
        };
        OperationService.pendingOperations = {};
        return OperationService;
    })();
    application.OperationService = OperationService;
    window.appModule.factory('OperationService', ["$http", "$location", "$q", "$timeout", "promiseCache", function ($http, $location, $q, $timeout, promiseCache) {
            return new OperationService($http, $location, $q, $timeout, promiseCache);
        }]);
})(application || (application = {}));

///<reference path="..\..\services\OperationService.ts"/>
/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../services/AccountService.ts"/>
/// <reference path="../../../typings/lodash/lodash.d.ts" />
var application;
(function (application) {
    var AccountController = (function () {
        function AccountController($scope, accountService, operationService, foundationApi, $timeout) {
            this.operationService = operationService;
            this.foundationApi = foundationApi;
            this.$timeout = $timeout;
            this.groups = [];
            this.LastOperationDump = "void";
            this.scope = $scope;
            $scope.vm = this;
            $scope.progressMax = 300;
            $scope.progressCurrent = 0;
            //this.currentHost = this.hosts[2];
            var me = this;
            $scope.$watch(function () { return me.groups; }, function () {
                me.scope.$evalAsync(function () {
                    me.refreshIsotope();
                });
            });
            $scope.$watch(function () { return me.accountContainer; }, function () {
                me.scope.$evalAsync(function () {
                    me.refreshAccountContainer();
                });
            });
            accountService.getAccountData().then(function (result) {
                me.accountContainer = result.data;
            });
        }
        AccountController.prototype.hasGroups = function () {
            return this.groups.length > 0;
        };
        AccountController.prototype.isCreateFirstGroupMode = function () {
            return !this.hasGroups();
        };
        AccountController.prototype.isManageGroupsMode = function () {
            return this.hasGroups();
        };
        AccountController.prototype.refreshAccountContainer = function () {
            //this.LastOperationDump = JSON.stringify(this.accountContainer);
            this.profile = this.accountContainer.AccountModule.Profile;
            this.groups = this.accountContainer.AccountModule.Roles.MemberInGroups.CollectionContent;
        };
        AccountController.prototype.refreshIsotope = function () {
            var elem = window.document.querySelector(".isotope-container");
            if (!elem)
                return;
            var wnd = window;
            var iso = new wnd.Isotope(elem, {});
        };
        AccountController.prototype.CreateGroup = function () {
            var me = this;
            var groupName = me.groupNameToCreate;
            this.operationService.executeOperation("TheBall.CORE.CreateGroup", {
                "name": groupName
            }); /* .then(data => me.LastOperationDump = JSON.stringify(data));*/
        };
        AccountController.$inject = ['$scope'];
        return AccountController;
    })();
    window.appModule.controller("AccountController", ["$scope", "AccountService", "OperationService", "FoundationApi", "$timeout",
        function ($scope, accountService, operationService, foundationApi, $timeout) { return new AccountController($scope, accountService, operationService, foundationApi, $timeout); }]);
})(application || (application = {}));
