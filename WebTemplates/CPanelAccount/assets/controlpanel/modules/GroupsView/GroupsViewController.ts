/**
 * Created by kalle on 3.6.2014.
 */


/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />


import ViewControllerBase = require("../ViewControllerBase");

class GroupsViewController extends ViewControllerBase {

    ControllerInitialize():void {
        var me = this;
        require(["GroupsView/Groups_dust",
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
                dust.render("Groups.dust", myData, (error, output) => {
                    if(error)
                        alert("Dust error: " + error);
                    var $hostDiv = $("#" + me.divID);
                    $hostDiv.empty();
                    $hostDiv.html(output);
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

    SetAsDefaultGroup($source) {
        var me = this;
        var groupURL = $source.attr("data-groupurl");
        var groupID = groupURL.substr(10,36);
        var wnd:any = window;
        this.CommonWaitForOperation("Making group as default...");
        this.currOPM.ExecuteOperationWithForm("SetGroupAsDefaultForAccount",
            {"GroupID": groupID},
            function() {
                me.CommonSuccessHandler();
                me.ReInitialize();
            },
            this.CommonErrorHandler);
    }

    ClearDefaultGroup($source) {
        var me = this;
        var wnd:any = window;
        this.CommonWaitForOperation("Clearing account's default group setting...");
        this.currOPM.ExecuteOperationWithForm("ClearDefaultGroupFromAccount",
            { },
            function() {
                me.CommonSuccessHandler();
                me.ReInitialize();
            },
            this.CommonErrorHandler);
    }

    OpenCreateNewGroupModal($source) {
        var me = this;
        var $modal:any = me.$getNamedFieldWithin("CreateNewGroupModal");
        me.$getNamedFieldWithinModal($modal, "GroupName").val("");
        $modal.foundation("reveal", "open");
    }

    Modal_CreateNewGroup($modal) {
        var redirectUrlAfterCreation = "cpanel/html/cpanel.html";
        var templateNameList = "cpanel,categoriesandcontent";

        var me = this;
        var groupName = me.$getNamedFieldWithinModal($modal, "GroupName").val();
        var jq:any = $;
        jq.blockUI({ message: '<h2>Creating new group...</h2>' });
        me.currOPM.ExecuteOperationWithForm("CreateGroupWithTemplates", {
            GroupName: groupName,
            TemplateNameList: templateNameList,
            RedirectUrlAfterCreation: redirectUrlAfterCreation
        }, function(responseData) {
            setTimeout(function() {
                jq.unblockUI();
                $modal.foundation("reveal", "close");
                me.ReInitialize();
            }, 2500);
        }, me.CommonErrorHandler);

    }
}

export = GroupsViewController;