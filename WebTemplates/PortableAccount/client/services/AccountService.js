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
                    //return me.$http.get('/data/AaltoGlobalImpact.OIP/AccountContainer/default.json');
                }
            });
        };
        return AccountService;
    })();
    application.AccountService = AccountService;
    window.appModule.factory('AccountService', ["$http", "$location", "promiseCache",
        function ($http, $location, promiseCache) { return new AccountService($http, $location, promiseCache); }]);
})(application || (application = {}));
