/**
* Created by kalle on 31.5.2014.
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../ViewControllerBase"], function(require, exports, ViewControllerBase) {
    var ConnectionViewController = (function (_super) {
        __extends(ConnectionViewController, _super);
        function ConnectionViewController() {
            _super.apply(this, arguments);
        }
        ConnectionViewController.prototype.ControllerInitialize = function () {
            var _this = this;
            var me = this;
            require([
                "ConnectionView/Connections_dust",
                "ConnectionView/ConnectionView_Modals_dust",
                "lib/dusts/objectdeleteicon_dust",
                "lib/dusts/command_button_dust",
                "lib/dusts/command_icon_dust",
                "lib/dusts/insidemodal_button_dust",
                "lib/dusts/hiddeninput_dust",
                "lib/dusts/openmodal_button_dust",
                "lib/dusts/modal_begin_dust",
                "lib/dusts/modal_end_dust"], function (template) {
                me.currUDG.GetData(_this.dataUrl, function (data) {
                    me.currData = data;

                    //console.log("Init: " + dataUrl);
                    me.UpdateConnectionsAvailableCommands(data.Connections.CollectionContent);
                    me.UpdateConnectionsHostAndGroupID(data.Connections.CollectionContent);
                    dust.render("Connections.dust", data, function (error, output) {
                        if (error)
                            alert("DUST ERROR: " + error);
                        var $hostDiv = $("#" + me.divID);
                        $hostDiv.empty();
                        $hostDiv.html(output);
                        me.ControllerInitializeDone();
                    });
                });
            });
        };

        ConnectionViewController.prototype.UpdateConnectionsHostAndGroupID = function (connections) {
            for (var i = 0; i < connections.length; i++) {
                var conn = connections[i];
                var currDevice = this.getObjectByID(this.currData.AuthenticatedAsDevices.CollectionContent, conn.DeviceID);
                if (currDevice) {
                    conn.ConnectionURL = currDevice.ConnectionURL;
                }
            }
        };

        ConnectionViewController.prototype.UpdateConnectionsAvailableCommands = function (connections) {
            for (var i = 0; i < connections.length; i++) {
                var conn = connections[i];
                conn.AvailableCommands = [];
                if (!conn.OtherSideConnectionID) {
                    conn.AvailableCommands.push({
                        ID: conn.ID,
                        Command: "FinalizeConnection",
                        Label: "Finalize Connection"
                    });
                } else {
                    conn.AvailableCommands.push({
                        ID: conn.ID,
                        Command: "SynchronizeConnectionCategories",
                        Label: "Synchronize Categories"
                    });
                    if (conn.ThisSideCategories.length) {
                        conn.AvailableCommands.push({
                            ID: conn.ID,
                            Command: "DefineCategoryMapping",
                            Label: "Define Category Mapping"
                        });
                    }
                }
            }
        };

        ConnectionViewController.prototype.VisibleTemplateRender = function () {
            //alert("Connections view ctrl visible render: " + this.divID);
        };

        ConnectionViewController.prototype.InvisibleTemplateRender = function () {
            //alert("Connections view ctrl invisible render: " + this.divID);
        };
        return ConnectionViewController;
    })(ViewControllerBase);

    
    return ConnectionViewController;
});
