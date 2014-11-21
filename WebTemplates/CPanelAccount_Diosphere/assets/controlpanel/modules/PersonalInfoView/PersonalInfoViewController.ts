/**
 * Created by kalle on 31.5.2014.
 */

/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />


import ViewControllerBase = require("../ViewControllerBase");

class PersonalInfoViewController extends ViewControllerBase {

    ControllerInitialize():void {
        var me = this;
        require(["PersonalInfoView/PersonalInfo_dust"], (template) => {
            dust.render("PersonalInfo.dust", {
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
        var accountProfile = this.currentData.AccountModule.Profile;
        //alert(JSON.stringify(groupProfile));

        var $profileImageInput = this.$getNamedFieldWithin("tmpProfileImage");
        if($profileImageInput.length == 1) {
            $profileImageInput.attr("data-oipfile-filegroupid", "personalProfileImage");
            var currentObject = accountProfile.ProfileImage;
            var imageSizeString = "256";
            var currentImagePath = currentObject && currentObject.ImageData
                ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
                : null;
            this.currOPM.InitiateBinaryFileElementsAroundInput($profileImageInput, accountProfile.ID, "ProfileImage", currentImagePath,
                "../assets/controlpanel/images/lightGray.jpg");
        }

        this.$getNamedFieldWithin("FirstName").val(accountProfile.FirstName);
        this.$getNamedFieldWithin("LastName").val(accountProfile.LastName);
    }

    public InvisibleTemplateRender():void {


    }

    myFunc() {
        alert("My stuff to do!");
    }

    Save() {
        var accountProfile = this.currentData.AccountModule.Profile;
        var objectID = accountProfile.ID;
        var objectRelativeLocation = this.currentData.RelativeLocation;
        var eTag = this.currentData.MasterETag;
        var firstName = this.$getNamedFieldWithin("FirstName").val();
        var lastName = this.$getNamedFieldWithin("LastName").val();

        var saveData = {
            FirstName: firstName,
            LastName: lastName,
        };
        var me = this;
        var profileImageID = accountProfile.ProfileImage.ID;
        var jq:any = $;
        //alert(profileImageID);
        //alert(objectID);
        this.currOPM.AppendBinaryFileValuesToData(objectID, saveData, function() {
            jq.blockUI({ message: '<h2>Saving...</h2>' });
            //alert(JSON.stringify(saveData));
            me.currOPM.SaveIndependentObject(objectID, objectRelativeLocation, eTag, saveData, function() {
                jq.unblockUI();
                me.ReInitialize();
            }, me.CommonErrorHandler, function(keyName) {
                if(keyName == "FileEmbedded_" + objectID + "_ProfileImage")
                    keyName = "FileEmbedded_" + profileImageID + "_ImageData";
                return keyName;
            });
        });
    }
}

export = PersonalInfoViewController;