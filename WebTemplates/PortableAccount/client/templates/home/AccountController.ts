///<reference path="..\..\services\OperationService.ts"/>
/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../services/AccountService.ts"/>
/// <reference path="../../../typings/lodash/lodash.d.ts" />

module application {

  interface IAccountController {
    CreateGroup:()=>void;
    isCreateFirstGroupMode:()=>boolean;
    isManageGroupsMode:()=>boolean;
  }

  class AccountController implements IAccountController {
    static $inject = ['$scope'];

    //progressMax:any;
    //progressCurrent:any;

    scope:any;
    groupNameToCreate:string;

    groups = [];

    email:string;

    LastOperationDump:string = "void";

    hasGroups():Boolean {
      return this.groups.length > 0;
    }

    isCreateFirstGroupMode():Boolean {
      return !this.hasGroups();
    }

    isManageGroupsMode():Boolean {
      return this.hasGroups();
    }

    constructor($scope, accountService:AccountService, private operationService:OperationService, private foundationApi:any, private $timeout:any) {
      this.scope = $scope;
      $scope.vm = this;
      $scope.progressMax = 300;
      $scope.progressCurrent = 0;
      //this.currentHost = this.hosts[2];
      var me = this;
      connectionService.getConnectionPrefillData().then(result => {
        var data = result.data;
        me.email = data.email;
        me.hosts = data.hosts;
      });
      connectionService.getConnectionData().then(result => {
        var data = result.data;
        me.connections = data.connections;
      });

      $scope.$watch(() => me.groups, function() {
        me.scope.$evalAsync(function() {
          me.refreshIsotope();
        });
      });
    }

    refreshIsotope()
    {
      var elem = window.document.querySelector(".isotope-container");
      if(!elem)
        return;
      var wnd:any = window;
      var iso = new wnd.Isotope(elem, {});
    }

    CreateGroup() {
      var me = this;
      var groupName = me.groupNameToCreate;
      this.operationService.executeOperation("TheBall.CORE.CreateGroup",
        {
          "name": groupName
        });/* .then(data => me.LastOperationDump = JSON.stringify(data));*/
    }

    /*
    GoToConnection(connectionID:string)
    {
      var me = this;
      me.foundationApi.publish("progressBarModal", "open");
      me.operationService.executeOperation("TheBall.LocalApp.GoToConnection",
        { "connectionID": connectionID}).then(
          successData => { me.foundationApi.publish("progressBarModal", "close") },
          failedData => me.LastOperationDump = "Failed: " + JSON.stringify(failedData),
          updateData => {
          me.scope.progressCurrent = me.scope.progressMax * updateData.progress;
        } );
    }*/

    /*
    UpdateTimeOut()
    {
      setTimeout(this.UpdateTimeOut, 1000);
    }

    DeleteConnection(connectionID:string) {
      var wnd:any = window;
      var me = this;
      //(<any>$("#progressBarModal")).foundation("reveal", "open");
      //(<any>$("#progressBarModal")).data("revealInit").close_on_background_click = false;
      me.foundationApi.publish("progressBarModal", "open");
      var repeat = function() {
        if(me.scope.progressCurrent < me.scope.progressMax)
          me.$timeout(repeat, 200);
        //else
        //  me.foundationApi.publish("progressBarModal", "close");
      };
      me.$timeout(repeat, 200);
      return;
      me.foundationApi.publish('main-notifications',
        { title: 'Deleting Connection', content: connectionID, autoclose: "3000",
          color: "alert"});
      this.operationService.executeOperation("TheBall.LocalApp.DeleteConnection",
        { "connectionID": connectionID }).then(data => me.LastOperationDump = JSON.stringify(data));
    }
    */
  }

  (<any>window).appModule.controller("AccountController",
    ["$scope", "AccountService", "OperationService", "FoundationApi", "$timeout",
      ($scope, accountService, operationService, foundationApi, $timeout)
        => new AccountController($scope, accountService, operationService, foundationApi, $timeout)]);
}
