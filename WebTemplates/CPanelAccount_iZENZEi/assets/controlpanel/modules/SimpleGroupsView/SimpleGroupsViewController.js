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
    var SimpleGroupsViewController = (function (_super) {
        __extends(SimpleGroupsViewController, _super);
        function SimpleGroupsViewController() {
            _super.apply(this, arguments);
        }
        SimpleGroupsViewController.prototype.ControllerInitialize = function () {
            var _this = this;
            var me = this;
            require([
                "SimpleGroupsView/SimpleGroups_dust",
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
                    dust.render("SimpleGroups.dust", myData, function (error, output) {
                        if (error)
                            alert("Dust error: " + error);
                        var $hostDiv = $("#" + me.divID);
                        $hostDiv.empty();
                        $hostDiv.html(output);
                        var $container = $("#isotope-group-container");
                        $container.isotope({ itemSelector: ".isotope-group", layoutMode: "fitRows" });
                        me.ControllerInitializeDone();
                    });
                });
            });
        };

        SimpleGroupsViewController.prototype.VisibleTemplateRender = function () {
        };

        SimpleGroupsViewController.prototype.InvisibleTemplateRender = function () {
        };
        return SimpleGroupsViewController;
    })(ViewControllerBase);

    
    return SimpleGroupsViewController;
});
