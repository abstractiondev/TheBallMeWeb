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
