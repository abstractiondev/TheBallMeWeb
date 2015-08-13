/**
 * Created by Kalle on 12.8.2015.
 */
define(["require", "exports"], function (require, exports) {
    /// <reference path="../../../assets/d/angularjs/angular.d.ts" />
    var sidebarDirective = (function () {
        function sidebarDirective() {
            var directive = {};
            directive.priority = 0;
            directive.restrict = "E";
            directive.scope = {};
            directive.transclude = true;
            directive.templateUrl = "sidebarView";
            directive.replace = true;
            directive.controller = function ($scope, $element) {
                this.flip = function () {
                    //Some func
                };
            };
            directive.replace = true;
            return directive;
        }
        sidebarDirective.$inject = [];
        return sidebarDirective;
    })();
    exports.sidebarDirective = sidebarDirective;
});
