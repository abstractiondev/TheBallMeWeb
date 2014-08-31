/**
 * Created by kalle on 31.5.2014.
 */

/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />

import ViewControllerBase = require("../ViewControllerBase");

class ConnectionViewController extends ViewControllerBase {
    currData:any;
    ControllerInitialize():void {
        var me = this;
        require(["ConnectionView/Connections_dust",
            "ConnectionView/ConnectionView_Modals_dust",
            "lib/dusts/objectdeleteicon_dust",
            "lib/dusts/command_button_dust",
            "lib/dusts/command_icon_dust",
            "lib/dusts/insidemodal_button_dust",
            "lib/dusts/hiddeninput_dust",
            "lib/dusts/openmodal_button_dust",
            "lib/dusts/modal_begin_dust",
            "lib/dusts/modal_end_dust"], (template) => {
            me.currUDG.GetData(this.dataUrl, function(data) {
                me.currData = data;
                //console.log("Init: " + dataUrl);
                me.UpdateConnectionsAvailableCommands(data.Connections.CollectionContent);
                me.UpdateConnectionsHostAndGroupID(data.Connections.CollectionContent);
                dust.render("Connections.dust", data, (error, output) => {
                    if(error)
                        alert("DUST ERROR: " + error);
                    var $hostDiv = $("#" + me.divID);
                    $hostDiv.empty();
                    $hostDiv.html(output);
                    me.ControllerInitializeDone();
                });
            });
        });
    }

    UpdateConnectionsHostAndGroupID(connections:any[]) {
        for(var i = 0; i < connections.length; i++) {
            var conn = connections[i];
            var currDevice = this.getObjectByID(this.currData.AuthenticatedAsDevices.CollectionContent, conn.DeviceID);
            if(currDevice) {
                conn.ConnectionURL = currDevice.ConnectionURL;
            }
        }
    }

    UpdateConnectionsAvailableCommands(connections:any[])
    {
        for(var i = 0; i < connections.length; i++) {
            var conn = connections[i];
            conn.AvailableCommands = [];
            if(!conn.OtherSideConnectionID) {
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
                if(conn.ThisSideCategories.length) {
                    conn.AvailableCommands.push({
                        ID: conn.ID,
                        Command: "DefineCategoryMapping",
                        Label: "Define Category Mapping"
                    });
                }
            }
        }
    }

    VisibleTemplateRender():void {
        //alert("Connections view ctrl visible render: " + this.divID);
    }

    InvisibleTemplateRender():void {
        //alert("Connections view ctrl invisible render: " + this.divID);
    }


}

export = ConnectionViewController;