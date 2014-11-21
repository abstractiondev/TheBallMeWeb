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
    var PersonalInfoViewController = (function (_super) {
        __extends(PersonalInfoViewController, _super);
        function PersonalInfoViewController() {
            _super.apply(this, arguments);
        }
        PersonalInfoViewController.prototype.ControllerInitialize = function () {
            var me = this;
            require(["PersonalInfoView/PersonalInfo_dust"], function (template) {
                dust.render("PersonalInfo.dust", {}, function (error, output) {
                    var $hostDiv = $("#" + me.divID);
                    $hostDiv.empty();
                    $hostDiv.html(output);
                    me.ControllerInitializeDone();
                });
            });
        };

        PersonalInfoViewController.prototype.VisibleTemplateRender = function () {
            var me = this;
            this.currUDG.GetData(this.dataUrl, function (myData) {
                me.currentData = myData;
                $.when(me.DoneInitializedPromise()).then(function () {
                    me.populateFromCurrentData();
                });
            });
        };

        PersonalInfoViewController.prototype.populateFromCurrentData = function () {
            var accountProfile = this.currentData.AccountModule.Profile;

            //alert(JSON.stringify(groupProfile));
            var $profileImageInput = this.$getNamedFieldWithin("tmpProfileImage");
            if ($profileImageInput.length == 1) {
                $profileImageInput.attr("data-oipfile-filegroupid", "personalProfileImage");
                var currentObject = accountProfile.ProfileImage;
                var imageSizeString = "256";
                var currentImagePath = currentObject && currentObject.ImageData ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt : null;
                this.currOPM.InitiateBinaryFileElementsAroundInput($profileImageInput, accountProfile.ID, "ProfileImage", currentImagePath, "../assets/controlpanel/images/lightGray.jpg");
            }

            this.$getNamedFieldWithin("FirstName").val(accountProfile.FirstName);
            this.$getNamedFieldWithin("LastName").val(accountProfile.LastName);
        };

        PersonalInfoViewController.prototype.InvisibleTemplateRender = function () {
        };

        PersonalInfoViewController.prototype.myFunc = function () {
            alert("My stuff to do!");
        };

        PersonalInfoViewController.prototype.Save = function () {
            var accountProfile = this.currentData.AccountModule.Profile;
            var objectID = accountProfile.ID;
            var objectRelativeLocation = this.currentData.RelativeLocation;
            var eTag = this.currentData.MasterETag;
            var firstName = this.$getNamedFieldWithin("FirstName").val();
            var lastName = this.$getNamedFieldWithin("LastName").val();

            var saveData = {
                FirstName: firstName,
                LastName: lastName
            };
            var me = this;
            var profileImageID = accountProfile.ProfileImage.ID;
            var jq = $;

            //alert(profileImageID);
            //alert(objectID);
            this.currOPM.AppendBinaryFileValuesToData(objectID, saveData, function () {
                jq.blockUI({ message: '<h2>Saving...</h2>' });

                //alert(JSON.stringify(saveData));
                me.currOPM.SaveIndependentObject(objectID, objectRelativeLocation, eTag, saveData, function () {
                    jq.unblockUI();
                    me.ReInitialize();
                }, me.CommonErrorHandler, function (keyName) {
                    if (keyName == "FileEmbedded_" + objectID + "_ProfileImage")
                        keyName = "FileEmbedded_" + profileImageID + "_ImageData";
                    return keyName;
                });
            });
        };
        return PersonalInfoViewController;
    })(ViewControllerBase);

    
    return PersonalInfoViewController;
});
