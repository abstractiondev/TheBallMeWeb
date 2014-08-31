/**
 * Created by kalle on 31.5.2014.
 */

/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />

import ViewControllerBase = require("../ViewControllerBase");

class DynamicContentViewController extends ViewControllerBase {
    currData:any;
    ControllerInitialize():void {
        var me = this;
        require(["DynamicContentView/DynamicContent_dust",
            "DynamicContentView/DynamicContentView_Modals_dust",
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
                dust.render("DynamicContent.dust", data, (error, output) => {
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

    VisibleTemplateRender():void {
        //alert("Connections view ctrl visible render: " + this.divID);
    }

    InvisibleTemplateRender():void {
        //alert("Connections view ctrl invisible render: " + this.divID);
    }

    OpenAddDynamicContentModal() {
        var $modal:any = this.$getNamedFieldWithin("AddNewDynamicContentModal");
        this.$getNamedFieldWithinModal($modal, "HostName").val("");
        this.$getNamedFieldWithinModal($modal, "ContentName").val("");
        this.$getNamedFieldWithinModal($modal, "ElementQuery").val("");
        this.$getNamedFieldWithinModal($modal, "Description").val("");
        this.$getNamedFieldWithinModal($modal, "RawContent").val("");
        this.$getNamedFieldWithinModal($modal, "Content").val("");
        var $content:any = this.$getNamedFieldWithinModal($modal, "Content");
        $content.destroyEditor();
        $content.val("");
        $content.redactor(
            {   minHeight: 300,
                maxHeight: 350,
                autoresize: false,
                buttons: ['bold', 'italic', 'alignment', 'unorderedlist', 'orderedlist', 'image', 'video', "link"]
            });
        $modal.foundation('reveal', 'open');
    }

    EditDynamicContent($source) {
        var $modal:any = this.$getNamedFieldWithin("EditDynamicContentModal");
        var me = this;
        var jq:any = $;
        var wnd:any = window;
        var clickedEditID = $source.attr("data-objectid");
        $.getJSON('../../AaltoGlobalImpact.OIP/DynamicContent/' + clickedEditID + ".json", function (contentData) {
            var currentObject = contentData;
            var currentID = currentObject.ID;
            var currentETag = currentObject.MasterETag;
            var currentRelativeLocation = currentObject.RelativeLocation;
            me.$getNamedFieldWithinModal($modal, "ID").val(currentID);
            me.$getNamedFieldWithinModal($modal, "ETag").val(currentETag);
            me.$getNamedFieldWithinModal($modal, "RelativeLocation").val(currentRelativeLocation);
            me.$getNamedFieldWithinModal($modal, "HostName").val(contentData.HostName);
            me.$getNamedFieldWithinModal($modal, "ContentName").val(contentData.ContentName);
            me.$getNamedFieldWithinModal($modal, "ElementQuery").val(contentData.ElementQuery);
            me.$getNamedFieldWithinModal($modal, "Description").val(contentData.Description);
            me.$getNamedFieldWithinModal($modal, "RawContent").val(contentData.RawContent);
            var $content:any = me.$getNamedFieldWithinModal($modal, "Content");
            $content.destroyEditor();
            $content.val(contentData.Content);
            $content.redactor(
                {   minHeight: 300,
                    maxHeight: 350,
                    autoresize: false,
                    buttons: ['bold', 'italic', 'alignment', 'unorderedlist', 'orderedlist', 'image', 'video', "link"]
                });
            $modal.foundation('reveal', 'open');
        });
    }

    ViewDynamicContent($source) {
        var $modal:any = this.$getNamedFieldWithin("ViewDynamicContentModal");
        var me = this;
        var jq:any = $;
        var wnd:any = window;
        var clickedEditID = $source.attr("data-objectid");
        $.getJSON('../../AaltoGlobalImpact.OIP/DynamicContent/' + clickedEditID + ".json", function (contentData) {
            var currentObject = contentData;
            me.$getNamedFieldWithinModal($modal, "HostName").html(contentData.HostName);
            me.$getNamedFieldWithinModal($modal, "ContentName").html(contentData.ContentName);
            me.$getNamedFieldWithinModal($modal, "ElementQuery").html(contentData.ElementQuery);
            me.$getNamedFieldWithinModal($modal, "Description").html(contentData.Description);
            if(contentData.RawContent)
                me.$getNamedFieldWithinModal($modal, "Content").html(contentData.RawContent);
            else
                me.$getNamedFieldWithinModal($modal, "Content").html(contentData.Content);
            $modal.foundation('reveal', 'open');
        });
    }

    Modal_SaveNewDynamicContent($modal) {
        var hostName = this.$getNamedFieldWithinModal($modal, "HostName").val();
        var contentName = this.$getNamedFieldWithinModal($modal, "ContentName").val();
        var elementQuery = this.$getNamedFieldWithinModal($modal, "ElementQuery").val();
        var description = this.$getNamedFieldWithinModal($modal, "Description").val();
        var rawContent = this.$getNamedFieldWithinModal($modal, "RawContent").val();
        rawContent = $("<div/>").text(rawContent).html();
        var content = this.$getNamedFieldWithinModal($modal, "Content").val();
        content = $('<div/>').text(content).html();

        var saveData = {
            HostName: hostName,
            ContentName: contentName,
            ElementQuery: elementQuery,
            Description: description,
            "ENC.RawContent": rawContent,
            "ENC.Content": content
        };

        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Adding new dynamic content...</h2>' });
        me.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "DynamicContent", saveData, function() {
            setTimeout(function () {
                jq.unblockUI();
                $modal.foundation('reveal', 'close');
                me.ReInitialize();
            }, 2500);
        }, me.CommonErrorHandler);
    }

    Modal_SaveExistingDynamicContent($modal) {
        var id = this.$getNamedFieldWithinModal($modal, "ID").val();
        var etag = this.$getNamedFieldWithinModal($modal, "ETag").val();
        var objectRelativeLocation = this.$getNamedFieldWithinModal($modal, "RelativeLocation").val();
        var hostName = this.$getNamedFieldWithinModal($modal, "HostName").val();
        var contentName = this.$getNamedFieldWithinModal($modal, "ContentName").val();
        var elementQuery = this.$getNamedFieldWithinModal($modal, "ElementQuery").val();
        var description = this.$getNamedFieldWithinModal($modal, "Description").val();
        var rawContent = this.$getNamedFieldWithinModal($modal, "RawContent").val();
        rawContent = $("<div/>").text(rawContent).html();
        var content = this.$getNamedFieldWithinModal($modal, "Content").val();
        content = $('<div/>').text(content).html();

        var saveData = {
            HostName: hostName,
            ContentName: contentName,
            ElementQuery: elementQuery,
            Description: description,
            "ENC.RawContent": rawContent,
            "ENC.Content": content
        };

        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Saving Dynamic Content...</h2>' });
        me.currOPM.SaveIndependentObject(id, objectRelativeLocation, etag, saveData, function() {
            setTimeout(function () {
                jq.unblockUI();
                $modal.foundation('reveal', 'close');
                me.ReInitialize();
            }, 2500);
        }, me.CommonErrorHandler);
    }

    DeleteObject($source) {
        var id = $source.data("objectid");
        var domainName = $source.data("domainname");
        var objectName = $source.data("objectname");
        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Deleting...</h2>' });
        this.currOPM.DeleteIndependentObject(domainName, objectName, id, function(responseData) {
            setTimeout(function() {
                jq.unblockUI();
                me.ReInitialize();
            }, 2500);
        });
    }



}

export = DynamicContentViewController;