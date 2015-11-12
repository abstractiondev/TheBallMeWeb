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
    window.appModule.factory('OperationService', ["$http", "$location", "$q", "$timeout", "promiseCache", function ($http, $location, $q, $timeout, promiseCache) { return new OperationService($http, $location, $q, $timeout, promiseCache); }]);
})(application || (application = {}));
