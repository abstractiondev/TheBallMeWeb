/**
 * Created by Kalle on 7.9.2015.
 */

/// <reference path="../../typings/angularjs/angular.d.ts" />

module application {
   interface IDeferredData {
   deferred:ng.IDeferred<any>;
   serviceInstance:OperationService;
   }

  export class OperationService {


    private static pendingOperations: { [operationID: string] : IDeferredData; } = {};
     private blockUI:any;

     public static SuccessPendingOperation(operationID:string, successParamsString:string)
     {
       var deferredData = OperationService.pendingOperations[operationID];
       var deferred = deferredData.deferred;
       //deferredData.serviceInstance.blockUI.stop();
       var wnd:any = window;
       var successParams = null;
       if(successParamsString)
         successParams = JSON.parse(successParamsString);
       deferred.resolve(successParams);
       delete OperationService.pendingOperations[operationID];
     }

     public static FailPendingOperation(operationID:string, failParamsString:string)
     {
       var deferredData = OperationService.pendingOperations[operationID];
       var deferred = deferredData.deferred;
       var wnd:any = window;
       wnd.$.unblockUI();
       var failParams = JSON.parse(failParamsString);
       deferred.reject(failParams);
       //deferredData.serviceInstance.blockUI.stop();
       delete OperationService.pendingOperations[operationID];
     }

     public static ProgressPendingOperation(operationID:string, progressParamsString:string)
     {
       var deferredData = OperationService.pendingOperations[operationID];
       var deferred = deferredData.deferred;
       //var progressParams = JSON.parse(progressParamsString);
       var progressParams = { progress: parseFloat(progressParamsString) };
       deferred.notify(progressParams);
     }

    public executeOperation(operationName:string, operationParams:any):any {
      var me = this;
      var wnd:any = window;
      var simulateServiceProgress:boolean = me.$location.protocol() == "http" && me.$location.host() == "localhost";
      if(wnd.TBJS2MobileBridge) {
        var stringParams = JSON.stringify(operationParams);
        var result = wnd.TBJS2MobileBridge.ExecuteAjaxOperation(operationName, stringParams);
        var resultObj = JSON.parse(result);
        var operationID = resultObj.OperationResult;
        //var success =
        var deferred = me.$q.defer();
        OperationService.pendingOperations[operationID] = { deferred: deferred, serviceInstance: me };
        return deferred.promise;
      } else if(!simulateServiceProgress) {
        var deferred = me.$q.defer();
        me.$http.post("https://tbvirtualhost/op/" + operationName, operationParams).then(response => {
          var resultObj = JSON.parse(response.data);
          var operationID = resultObj.OperationResult;
          OperationService.pendingOperations[operationID] = { deferred: deferred, serviceInstance:me };
        });
        return deferred.promise;
      } else { // simulate service progress
        var deferred = me.$q.defer();
        var progressCurrent:number = 0;
        var progressSimulation = function() {
          progressCurrent += 5;
          if(progressCurrent >= 100) {
            deferred.resolve();
          }
          else {
            deferred.notify({ progress: progressCurrent / 100, statusMessage: "Proceeding: " + progressCurrent});
            me.$timeout(progressSimulation, 200)
          }
          //else
          //  me.foundationApi.publish("progressBarModal", "close");
        };
        me.$timeout(progressSimulation, 200);
        return deferred.promise;
      }
    }

    constructor(private $http, private $location, private $q, private $timeout, private promiseCache) {

    }
  }


  (<any>window).appModule.factory('OperationService', ["$http", "$location", "$q", "$timeout", "promiseCache", ($http, $location, $q, $timeout, promiseCache)
    => new OperationService($http, $location, $q, $timeout, promiseCache)]);

}


