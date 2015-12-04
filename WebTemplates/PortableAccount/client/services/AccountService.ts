/// <reference path="../../typings/angularjs/angular.d.ts" />

module application {
  export class AccountService {
    public getAccountData():any {
      var me = this;
      return this.promiseCache({
        promise: function() {
          return me.$http.get('../../AaltoGlobalImpact.OIP/AccountContainer/default.json');
        }
      });
    }

    constructor(private $http, $location, private promiseCache) {

    }
  }


  (<any>window).appModule.factory('AccountService', ["$http", "$location", "promiseCache",
    ($http, $location, promiseCache) => new AccountService($http, $location, promiseCache)]);
}

