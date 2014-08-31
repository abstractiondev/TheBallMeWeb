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
    var GroupMemberViewController = (function (_super) {
        __extends(GroupMemberViewController, _super);
        function GroupMemberViewController() {
            _super.apply(this, arguments);
        }
        GroupMemberViewController.prototype.ControllerInitialize = function () {
            var _this = this;
            var me = this;
            require([
                "GroupMemberView/GroupMembers_dust",
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
                    dust.render("GroupMembers.dust", myData, function (error, output) {
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

        GroupMemberViewController.prototype.VisibleTemplateRender = function () {
        };

        GroupMemberViewController.prototype.InvisibleTemplateRender = function () {
        };

        GroupMemberViewController.prototype.InviteNewMember = function () {
            var emailAddress = this.$getNamedFieldWithin("InviteNewMemberEmail").val();
            this.CommonWaitForOperation("Inviting new member...");
            this.currOPM.ExecuteOperationWithForm("InviteMemberToGroup", { "EmailAddress": emailAddress }, this.CommonSuccessHandler, this.CommonErrorHandler);
        };

        GroupMemberViewController.prototype.OpenModalRemoveMemberModal = function ($source) {
            var accountID = $source.attr("data-accountid");
            var collaborators = this.currentData.Collaborators.CollectionContent;
            var collaboratorToRemove = null;
            for (var i = 0; i < collaborators.length; i++) {
                var currItem = collaborators[i];
                if (currItem.AccountID == accountID) {
                    collaboratorToRemove = currItem;
                    break;
                }
            }
            if (!collaboratorToRemove)
                throw "Cannot find matching collaborator, that was there before!";
            var $removeMemberModal = this.$getNamedFieldWithin("RemoveMemberModal");
            var $collaboratorNameField = this.$getNamedFieldWithinModal($removeMemberModal, "CollaboratorName");
            $collaboratorNameField.html(collaboratorToRemove.CollaboratorName);
            var $accountIDField = this.$getNamedFieldWithinModal($removeMemberModal, "AccountID");
            $accountIDField.val(accountID);
            $removeMemberModal.foundation("reveal", "open");
        };

        GroupMemberViewController.prototype.Modal_RemoveCollaborator = function ($modal) {
            var accountID = this.$getNamedFieldWithinModal($modal, "AccountID").val();
            var wnd = window;
            this.CommonWaitForOperation("Removing member...");
            this.currOPM.ExecuteOperationWithForm("RemoveCollaboratorFromGroup", { "AccountID": accountID }, this.CommonSuccessHandler, this.CommonErrorHandler);
            /*
            var saveData = {
            GroupName: groupName,
            Description: description,
            OrganizationsAndGroupsLinkedToUs: organizationsAndGroupsLinkedToUs,
            WwwSiteToPublishTo: wwwSiteToPublishTo
            };
            this.currOPM.SaveIndependentObject(objectID, objectRelativeLocation, eTag, saveData);
            */
        };
        return GroupMemberViewController;
    })(ViewControllerBase);

    
    return GroupMemberViewController;
});
