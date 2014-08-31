/**
* Created by kalle on 3.6.2014.
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../ViewControllerBase"], function(require, exports, ViewControllerBase) {
    var GroupsViewController = (function (_super) {
        __extends(GroupsViewController, _super);
        function GroupsViewController() {
            _super.apply(this, arguments);
        }
        GroupsViewController.prototype.ControllerInitialize = function () {
            var _this = this;
            var me = this;
            require([
                "GroupsView/Groups_dust",
                "lib/dusts/command_button_begin_dust",
                "lib/dusts/command_button_end_dust",
                "lib/dusts/command_button_dust",
                "lib/dusts/modal_begin_dust",
                "lib/dusts/textinput_singleline_dust",
                "lib/dusts/modal_end_dust",
                "lib/dusts/hiddeninput_dust",
                "lib/dusts/openmodal_button_dust",
                "lib/dusts/insidemodal_button_dust"
            ], function (template) {
                _this.currUDG.GetData(_this.dataUrl, function (myData) {
                    me.currentData = myData;
                    dust.render("Groups.dust", myData, function (error, output) {
                        if (error)
                            alert("Dust error: " + error);
                        var $hostDiv = $("#" + me.divID);
                        $hostDiv.empty();
                        $hostDiv.html(output);
                        me.ControllerInitializeDone();
                    });
                });
            });
        };

        GroupsViewController.prototype.VisibleTemplateRender = function () {
        };

        GroupsViewController.prototype.InvisibleTemplateRender = function () {
        };

        GroupsViewController.prototype.SetAsDefaultGroup = function ($source) {
            var me = this;
            var groupURL = $source.attr("data-groupurl");
            var groupID = groupURL.substr(10, 36);
            var wnd = window;
            this.CommonWaitForOperation("Making group as default...");
            this.currOPM.ExecuteOperationWithForm("SetGroupAsDefaultForAccount", { "GroupID": groupID }, function () {
                me.CommonSuccessHandler();
                me.ReInitialize();
            }, this.CommonErrorHandler);
        };

        GroupsViewController.prototype.ClearDefaultGroup = function ($source) {
            var me = this;
            var wnd = window;
            this.CommonWaitForOperation("Clearing account's default group setting...");
            this.currOPM.ExecuteOperationWithForm("ClearDefaultGroupFromAccount", {}, function () {
                me.CommonSuccessHandler();
                me.ReInitialize();
            }, this.CommonErrorHandler);
        };
        return GroupsViewController;
    })(ViewControllerBase);

    
    return GroupsViewController;
});
