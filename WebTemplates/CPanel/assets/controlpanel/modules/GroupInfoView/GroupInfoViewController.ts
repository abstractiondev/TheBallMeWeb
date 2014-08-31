/**
 * Created by kalle on 31.5.2014.
 */

/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />


import ViewControllerBase = require("../ViewControllerBase");

class GroupInfoViewController extends ViewControllerBase {

    ControllerInitialize():void {
        var me = this;
        require(["GroupInfoView/GroupInfo_dust"], (template) => {
            dust.render("GroupInfo.dust", {
            }, (error, output) =>  {
                var $hostDiv = $("#" + me.divID);
                $hostDiv.empty();
                $hostDiv.html(output);
                me.ControllerInitializeDone();
            });
        });
    }

    // Instead of hidden fields in "form", we can store the last fetched data as current
    currentData:any;

    public VisibleTemplateRender():void {
        var me = this;
        this.currUDG.GetData(this.dataUrl, myData => {
            me.currentData = myData;
            $.when(me.DoneInitializedPromise()).then(() => {
                me.populateFromCurrentData();
            });
        });
    }

    public populateFromCurrentData() {
        var groupProfile = this.currentData.GroupProfile;
        //alert(JSON.stringify(groupProfile));

        var $profileImageInput = this.$getNamedFieldWithin("tmpProfileImage");
        if($profileImageInput.length == 1) {
            $profileImageInput.attr("data-oipfile-filegroupid", "groupProfileImage");
            var currentObject = groupProfile.ProfileImage;
            var imageSizeString = "256";
            var currentImagePath = currentObject && currentObject.ImageData
                ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
                : null;
            this.currOPM.InitiateBinaryFileElementsAroundInput($profileImageInput, groupProfile.ID, "ProfileImage", currentImagePath,
                "../assets/controlpanel/images/lightGray.jpg");
        }

        var $iconImageInput = this.$getNamedFieldWithin("tmpIconImage");
        if($iconImageInput.length == 1) {
            $iconImageInput.attr("data-oipfile-filegroupid", "groupIconImage");
            currentObject = groupProfile.IconImage;
            currentImagePath = currentObject && currentObject.ImageData
                ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
                : null;
            this.currOPM.InitiateBinaryFileElementsAroundInput($iconImageInput, groupProfile.ID, "IconImage", currentImagePath,
                "../assets/controlpanel/images/lightGray.jpg");
        }

        this.$getNamedFieldWithin("GroupName").val(groupProfile.GroupName);
        this.$getNamedFieldWithin("Description").val(groupProfile.Description);
        this.$getNamedFieldWithin("OrganizationsAndGroupsLinkedToUs").val(groupProfile.OrganizationsAndGroupsLinkedToUs);
        this.$getNamedFieldWithin("WwwSiteToPublishTo").val(groupProfile.WwwSiteToPublishTo);
    }

    public InvisibleTemplateRender():void {


    }

    myFunc() {
        alert("My stuff to do!");
    }

    Save() {
        var objectID = this.currentData.GroupProfile.ID;
        var objectRelativeLocation = this.currentData.RelativeLocation;
        var eTag = this.currentData.MasterETag;
        var groupName = this.$getNamedFieldWithin("GroupName").val();
        var description = this.$getNamedFieldWithin("Description").val();
        var organizationsAndGroupsLinkedToUs = this.$getNamedFieldWithin("OrganizationsAndGroupsLinkedToUs").val();
        var wwwSiteToPublishTo = this.$getNamedFieldWithin("WwwSiteToPublishTo").val();

        var saveData = {
            GroupName: groupName,
            Description: description,
            OrganizationsAndGroupsLinkedToUs: organizationsAndGroupsLinkedToUs,
            WwwSiteToPublishTo: wwwSiteToPublishTo
        };
        var me = this;
        var profileImageID = this.currentData.GroupProfile.ProfileImage.ID;
        var iconImageID = this.currentData.GroupProfile.IconImage.ID;
        var jq:any = $;
        //alert(profileImageID);
        //alert(objectID);
        this.currOPM.AppendBinaryFileValuesToData(objectID, saveData, function() {
            jq.blockUI({ message: '<h2>Saving...</h2>' });
            //alert(JSON.stringify(saveData));
            me.currOPM.SaveIndependentObject(objectID, objectRelativeLocation, eTag, saveData, function() {
                jq.unblockUI();
                me.ReInitialize();
            }, function() {
                alert("Save failed!");
                jq.unblockUI();
            }, function(keyName) {
                if(keyName == "FileEmbedded_" + objectID + "_ProfileImage")
                    keyName = "FileEmbedded_" + profileImageID + "_ImageData";
                if(keyName == "FileEmbedded_" + objectID + "_IconImage")
                    keyName = "FileEmbedded_" + iconImageID + "_ImageData";
                return keyName;
            });
        });
    }
}

export = GroupInfoViewController;