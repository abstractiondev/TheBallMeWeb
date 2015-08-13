/**
 * Created by Kalle on 12.8.2015.
 */

/// <reference path="../../../assets/d/angularjs/angular.d.ts" />


export class sidebarDirective {
  public static $inject: Array<string> = [];

  constructor() {
    var directive: ng.IDirective = {};
    directive.priority = 0;
    directive.restrict = "E";
    directive.scope = {};
    directive.transclude = true;
    directive.templateUrl = "sidebarView";
    directive.replace = true;
    directive.controller = function ($scope, $element) {
      this.flip = function () {
        //Some func
      }
    }
    directive.replace = true;

    return directive;

  }
}
