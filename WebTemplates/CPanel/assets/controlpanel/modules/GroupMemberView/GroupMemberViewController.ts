/**
 * Created by kalle on 3.6.2014.
 */


/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />


import ViewControllerBase = require("../ViewControllerBase");

class GroupMemberViewController extends ViewControllerBase {

    ControllerInitialize():void {
        var me = this;
        require(["GroupMemberView/GroupMembers_dust",
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
                dust.render("GroupMembers.dust", myData, (error, output) => {
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

    InviteNewMember() {
        var emailAddress = this.$getNamedFieldWithin("InviteNewMemberEmail").val();
        this.CommonWaitForOperation("Inviting new member...");
        this.currOPM.ExecuteOperationWithForm("InviteMemberToGroup",
            { "EmailAddress": emailAddress},
                this.CommonSuccessHandler,
                this.CommonErrorHandler);
    }

    OpenModalRemoveMemberModal($source)
    {
        var accountID = $source.attr("data-accountid");
        var collaborators = this.currentData.Collaborators.CollectionContent;
        var collaboratorToRemove:any = null;
        for(var i = 0; i < collaborators.length; i++) {
            var currItem = collaborators[i];
            if(currItem.AccountID == accountID) {
                collaboratorToRemove = currItem;
                break;
            }
        }
        if(!collaboratorToRemove)
            throw "Cannot find matching collaborator, that was there before!";
        var $removeMemberModal:any = this.$getNamedFieldWithin("RemoveMemberModal");
        var $collaboratorNameField = this.$getNamedFieldWithinModal($removeMemberModal, "CollaboratorName");
        $collaboratorNameField.html(collaboratorToRemove.CollaboratorName);
        var $accountIDField = this.$getNamedFieldWithinModal($removeMemberModal, "AccountID");
        $accountIDField.val(accountID);
        $removeMemberModal.foundation("reveal", "open");
    }

    Modal_RemoveCollaborator($modal) {
        var accountID = this.$getNamedFieldWithinModal($modal, "AccountID").val();
        var wnd:any = window;
        this.CommonWaitForOperation("Removing member...");
        this.currOPM.ExecuteOperationWithForm("RemoveCollaboratorFromGroup",
            {"AccountID": accountID},
            this.CommonSuccessHandler,
            this.CommonErrorHandler);
        /*
        var saveData = {
            GroupName: groupName,
            Description: description,
            OrganizationsAndGroupsLinkedToUs: organizationsAndGroupsLinkedToUs,
            WwwSiteToPublishTo: wwwSiteToPublishTo
        };
        this.currOPM.SaveIndependentObject(objectID, objectRelativeLocation, eTag, saveData);
        */
    }
}

export = GroupMemberViewController;