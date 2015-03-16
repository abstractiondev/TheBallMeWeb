/**
 * Created by kalle on 3.6.2014.
 */


/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />


import ViewControllerBase = require("../ViewControllerBase");

class SimpleGroupsViewController extends ViewControllerBase {

    ControllerInitialize():void {
        var me = this;
        require(["SimpleGroupsView/SimpleGroups_dust",
            "lib/dusts/command_button_begin_dust",
            "lib/dusts/command_button_end_dust",
            "lib/dusts/command_button_dust",
            "lib/dusts/modal_begin_dust",
            "lib/dusts/textinput_singleline_dust",
            "lib/dusts/modal_end_dust",
            "lib/dusts/hiddeninput_dust",
            "lib/dusts/openmodal_button_dust",
            "lib/dusts/insidemodal_button_dust"
        ], (template) => {
            this.currUDG.GetData(this.dataUrl, myData => {
                me.currentData = myData;
                dust.render("SimpleGroups.dust", myData, (error, output) => {
                    if(error)
                        alert("Dust error: " + error);
                    var $hostDiv = $("#" + me.divID);
                    $hostDiv.empty();
                    $hostDiv.html(output);
                    var $container:any = $("#isotope-group-container");
                    $container.isotope({ itemSelector: ".isotope-group", layoutMode: "fitRows" });
                    me.ControllerInitializeDone();
                });
            });
        });
    }

    // Instead of hidden fields in "form", we can store the last fetched data as current
    currentData:any;

    public VisibleTemplateRender():void {
    }

    public InvisibleTemplateRender():void {
    }
}

export = SimpleGroupsViewController;