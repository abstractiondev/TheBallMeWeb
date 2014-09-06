/**
 * Created by kalle on 31.5.2014.
 */

/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />


import ViewControllerBase = require("../ViewControllerBase");

class PersonalSecurityViewController extends ViewControllerBase {

    ControllerInitialize():void {
        var me = this;
        require(["PersonalSecurityView/PersonalSecurity_dust",
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
        ], (template) => {
            this.currUDG.GetData(this.dataUrl, myData => {
                me.currentData = myData;
                dust.render("PersonalSecurity.dust", myData, (error, output) =>  {
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
        var me = this;
        $.when(me.DoneInitializedPromise()).then(() => {
            var hasAnyEmails = me.currentData.EmailCollection.CollectionContent.length > 0;
            var $emailRegistrationGuide = me.$getNamedFieldWithin("EmailRegistrationNotification");
            if(hasAnyEmails) {
                $emailRegistrationGuide.hide();
            } else {
                $emailRegistrationGuide.show();
            }

        });
    }

    public InvisibleTemplateRender():void {


    }

    OpenRegisterNewEmailModal($source) {
        var me = this;
        var $modal:any = me.$getNamedFieldWithin("RegisterNewEmailModal");
        me.$getNamedFieldWithinModal($modal, "EmailAddress").val("");
        $modal.foundation("reveal", "open");
    }

    UnRegisterEmail($source) {
        var me = this;
        var emailAddress = $source.attr("data-oip-command-args");
        var jq:any = $;
        jq.blockUI({ message: '<h2>Removing email address...</h2>' });
        me.currOPM.ExecuteOperationWithForm("UnregisterEmailAddress", {
            EmailAddress: emailAddress
        }, function(responseData) {
            setTimeout(function() {
                jq.unblockUI();
                me.ReInitialize();
            }, 2500);
        }, me.CommonErrorHandler);
    }

    Modal_RegisterNewEmail($modal) {
        var me = this;
        var emailAddress = me.$getNamedFieldWithinModal($modal, "EmailAddress").val();
        var jq:any = $;
        jq.blockUI({ message: '<h2>Initiating email registration...</h2>' });
        me.currOPM.ExecuteOperationWithForm("BeginAccountEmailAddressRegistration", {
            EmailAddress: emailAddress
            }, function(responseData) {
            setTimeout(function() {
                jq.unblockUI();
                $modal.foundation("reveal", "close");
                me.ReInitialize();
            }, 2500);
        }, me.CommonErrorHandler);
    }

    Modal_MergeAccountsByEmail($modal) {
        var me = this;
        var emailAddress = me.$getNamedFieldWithinModal($modal, "EmailAddress").val();
        var jq:any = $;
        jq.blockUI({ message: '<h2>Initiating account merge process...</h2>' });
        me.currOPM.ExecuteOperationWithForm("InitiateAccountMergeFromEmail", {
            EmailAddress: emailAddress
        }, function(responseData) {
            setTimeout(function() {
                jq.unblockUI();
                $modal.foundation("reveal", "close");
                me.ReInitialize();
            }, 2500);
        }, me.CommonErrorHandler);
    }

}

export = PersonalSecurityViewController;