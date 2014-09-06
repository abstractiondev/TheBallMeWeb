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
    var PersonalSecurityViewController = (function (_super) {
        __extends(PersonalSecurityViewController, _super);
        function PersonalSecurityViewController() {
            _super.apply(this, arguments);
        }
        PersonalSecurityViewController.prototype.ControllerInitialize = function () {
            var _this = this;
            var me = this;
            require([
                "PersonalSecurityView/PersonalSecurity_dust",
                "lib/dusts/command_button_begin_dust",
                "lib/dusts/command_button_end_dust",
                "lib/dusts/command_button_dust",
                "lib/dusts/command_icon_dust",
                "lib/dusts/modal_begin_dust",
                "lib/dusts/textinput_singleline_dust",
                "lib/dusts/modal_end_dust",
                "lib/dusts/hiddeninput_dust",
                "lib/dusts/openmodal_button_dust",
                "lib/dusts/insidemodal_button_dust"
            ], function (template) {
                _this.currUDG.GetData(_this.dataUrl, function (myData) {
                    me.currentData = myData;
                    dust.render("PersonalSecurity.dust", myData, function (error, output) {
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

        PersonalSecurityViewController.prototype.VisibleTemplateRender = function () {
            var me = this;
            $.when(me.DoneInitializedPromise()).then(function () {
                var hasAnyEmails = me.currentData.EmailCollection.CollectionContent.length > 0;
                var $emailRegistrationGuide = me.$getNamedFieldWithin("EmailRegistrationNotification");
                if (hasAnyEmails) {
                    $emailRegistrationGuide.hide();
                } else {
                    $emailRegistrationGuide.show();
                }
            });
        };

        PersonalSecurityViewController.prototype.InvisibleTemplateRender = function () {
        };

        PersonalSecurityViewController.prototype.OpenRegisterNewEmailModal = function ($source) {
            var me = this;
            var $modal = me.$getNamedFieldWithin("RegisterNewEmailModal");
            me.$getNamedFieldWithinModal($modal, "EmailAddress").val("");
            $modal.foundation("reveal", "open");
        };

        PersonalSecurityViewController.prototype.UnRegisterEmail = function ($source) {
            var me = this;
            var emailAddress = $source.attr("data-oip-command-args");
            var jq = $;
            jq.blockUI({ message: '<h2>Removing email address...</h2>' });
            me.currOPM.ExecuteOperationWithForm("UnregisterEmailAddress", {
                EmailAddress: emailAddress
            }, function (responseData) {
                setTimeout(function () {
                    jq.unblockUI();
                    me.ReInitialize();
                }, 2500);
            }, me.CommonErrorHandler);
        };

        PersonalSecurityViewController.prototype.Modal_RegisterNewEmail = function ($modal) {
            var me = this;
            var emailAddress = me.$getNamedFieldWithinModal($modal, "EmailAddress").val();
            var jq = $;
            jq.blockUI({ message: '<h2>Initiating email registration...</h2>' });
            me.currOPM.ExecuteOperationWithForm("BeginAccountEmailAddressRegistration", {
                EmailAddress: emailAddress
            }, function (responseData) {
                setTimeout(function () {
                    jq.unblockUI();
                    $modal.foundation("reveal", "close");
                    me.ReInitialize();
                }, 2500);
            }, me.CommonErrorHandler);
        };

        PersonalSecurityViewController.prototype.Modal_MergeAccountsByEmail = function ($modal) {
            var me = this;
            var emailAddress = me.$getNamedFieldWithinModal($modal, "EmailAddress").val();
            var jq = $;
            jq.blockUI({ message: '<h2>Initiating account merge process...</h2>' });
            me.currOPM.ExecuteOperationWithForm("InitiateAccountMergeFromEmail", {
                EmailAddress: emailAddress
            }, function (responseData) {
                setTimeout(function () {
                    jq.unblockUI();
                    $modal.foundation("reveal", "close");
                    me.ReInitialize();
                }, 2500);
            }, me.CommonErrorHandler);
        };
        return PersonalSecurityViewController;
    })(ViewControllerBase);

    
    return PersonalSecurityViewController;
});
