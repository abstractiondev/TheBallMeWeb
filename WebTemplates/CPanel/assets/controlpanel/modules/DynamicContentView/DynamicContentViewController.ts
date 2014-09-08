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
            "DynamicContentView/DynamicContentAdvanced_dust",
            "DynamicContentView/DynamicContentPageSkeleton_dust",
            "DynamicContentView/DynamicContentView_Modals_dust",
            "DynamicContentView/DynamicContentPageHost_dust",
            "DynamicContentView/DynamicContentGroupEditView_dust",
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
                    if(me.StateContent.LastActiveSection)
                        me.ActivateSection(me.StateContent.LastActiveSection);
                    $hostDiv.find(".oiphover-showlocation").hover(function() {
                        var $canvas = $hostDiv.find("canvas.oipdynamiccontentlocationview")
                        var canvas = <HTMLCanvasElement> $canvas[0];
                        me.DisplayLocation($(this), canvas);
                    }, function() {
                        me.ClearCanvas($(this));
                    });
                    $hostDiv.find(".oipcanvas-showlocation").each(function(index, element) {
                        var $canvas = $(this).find("canvas");
                        var canvas:HTMLCanvasElement = <HTMLCanvasElement> $canvas[0];
                        me.DisplayLocation($(this), canvas);
                    });
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

    ClearCanvas($element) {
        var $hostDiv = $("#" + this.divID);
        var $canvas = $hostDiv.find("canvas.oipdynamiccontentlocationview")
        this.CurrentCanvas = <HTMLCanvasElement> $canvas[0];
        var canvas = this.CurrentCanvas;
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    DisplayLocation($element, canvas:HTMLCanvasElement) {
        var pageLocation = $element.attr("data-pagelocation");
        if(!pageLocation)
            return;
        var locations = pageLocation.split(";");
        if(locations.length != 4)
            return;
        var startX = parseFloat(locations[0]);
        var startY = parseFloat(locations[1]);
        var endX = parseFloat(locations[2]);
        var endY = parseFloat(locations[3]);
        var width = canvas.width;
        var height = canvas.height;
        var ctx = canvas.getContext("2d");

        var startXCoord = (startX * width) / 10;
        var startYCoord = (startY * height) / 10;
        var endXCoord = (endX * width) / 10;
        var endYCoord = (endY * height) / 10;
        var rectWidth = endXCoord - startXCoord;
        var rectHeight = endYCoord - startYCoord;
        // Red rectangle
        ctx.beginPath();
        ctx.lineWidth=6;
        ctx.strokeStyle="green";
        ctx.rect(startXCoord,startYCoord,rectWidth,rectHeight);
        ctx.stroke();
        //console.log("Drawn: " + startXCoord + " " + startYCoord + " " + endXCoord + " " + endYCoord);
    }

    SetActiveSection($source) {
        var wnd:any = window;
        wnd.Foundation.libs.dropdown.close($("#drop-SelectDynamicContentPage"));
        var activatedSectionName = $source.attr("data-templatename");
        this.ActivateSection(activatedSectionName);
    }

    CurrentCanvas:HTMLCanvasElement;
    ActivateSection(sectionName) {
        this.$getSelectedFieldsWithin(".oipdynamiccontenteditorsection").hide();
        var $activeSection = this.$getNamedFieldWithin(sectionName);
        $activeSection.show();
        this.StateContent.LastActiveSection = sectionName;
    }

    OpenAddDynamicContentGroupModal() {
        var $modal:any = this.$getNamedFieldWithin("AddNewDynamicContentGroupModal");
        this.$getNamedFieldWithinModal($modal, "HostName").val("");
        this.$getNamedFieldWithinModal($modal, "GroupHeader").val("");
        this.$getNamedFieldWithinModal($modal, "SortValue").val("");
        this.$getNamedFieldWithinModal($modal, "PageLocation").val("");
        this.$getNamedFieldWithinModal($modal, "ContentItemNames").val("");
        $modal.foundation('reveal', 'open');
    }

    EditDynamicContentGroup($source) {
        var $modal:any = this.$getNamedFieldWithin("EditDynamicContentGroupModal");
        var me = this;
        var jq:any = $;
        var wnd:any = window;
        var clickedEditID = $source.attr("data-objectid");
        $.getJSON('../../AaltoGlobalImpact.OIP/DynamicContentGroup/' + clickedEditID + ".json", function (contentData) {
            var currentObject = contentData;
            var currentID = currentObject.ID;
            var currentETag = currentObject.MasterETag;
            var currentRelativeLocation = currentObject.RelativeLocation;
            me.$getNamedFieldWithinModal($modal, "ID").val(currentID);
            me.$getNamedFieldWithinModal($modal, "ETag").val(currentETag);
            me.$getNamedFieldWithinModal($modal, "RelativeLocation").val(currentRelativeLocation);
            me.$getNamedFieldWithinModal($modal, "HostName").val(contentData.HostName);
            me.$getNamedFieldWithinModal($modal, "GroupHeader").val(contentData.GroupHeader);
            me.$getNamedFieldWithinModal($modal, "SortValue").val(contentData.SortValue);
            me.$getNamedFieldWithinModal($modal, "PageLocation").val(contentData.PageLocation);
            me.$getNamedFieldWithinModal($modal, "ContentItemNames").val(contentData.ContentItemNames);
            $modal.foundation('reveal', 'open');
        });
    }


    OpenAddDynamicContentModal() {
        var $modal:any = this.$getNamedFieldWithin("AddNewDynamicContentModal");
        this.$getNamedFieldWithinModal($modal, "HostName").val("");
        this.$getNamedFieldWithinModal($modal, "ContentName").val("");
        this.$getNamedFieldWithinModal($modal, "ElementQuery").val("");
        this.$getNamedFieldWithinModal($modal, "EditType").val("");
        this.$getNamedFieldWithinModal($modal, "PageLocation").val("");
        this.$getNamedFieldWithinModal($modal, "Description").val("");
        this.$getNamedFieldWithinModal($modal, "RawContent").val("");
        this.$getNamedFieldWithinModal($modal, "Content").val("");
        this.$getNamedFieldWithinModal($modal, "ApplyActively").prop("checked", false);
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
            me.$getNamedFieldWithinModal($modal, "EditType").val(contentData.EditType);
            me.$getNamedFieldWithinModal($modal, "PageLocation").val(contentData.PageLocation);
            me.$getNamedFieldWithinModal($modal, "Description").val(contentData.Description);
            me.$getNamedFieldWithinModal($modal, "RawContent").val(contentData.RawContent);
            me.$getNamedFieldWithinModal($modal, "ApplyActively").prop("checked", contentData.ApplyActively);
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
            me.$getNamedFieldWithinModal($modal, "EditType").html(contentData.EditType);
            me.$getNamedFieldWithinModal($modal, "PageLocation").html(contentData.PageLocation);
            me.$getNamedFieldWithinModal($modal, "Description").html(contentData.Description);
            me.$getNamedFieldWithinModal($modal, "ApplyActively").html(contentData.ApplyActively);
            if(contentData.RawContent)
                me.$getNamedFieldWithinModal($modal, "Content").html(contentData.RawContent);
            else
                me.$getNamedFieldWithinModal($modal, "Content").html(contentData.Content);
            $modal.foundation('reveal', 'open');
        });
    }

    Modal_SaveNewDynamicContentGroup($modal) {
        var hostName = this.$getNamedFieldWithinModal($modal, "HostName").val();
        var groupHeader = this.$getNamedFieldWithinModal($modal, "GroupHeader").val();
        var sortValue = this.$getNamedFieldWithinModal($modal, "SortValue").val();
        var pageLocation = this.$getNamedFieldWithinModal($modal, "PageLocation").val();
        var contentItemNames = this.$getNamedFieldWithinModal($modal, "ContentItemNames").val();

        var saveData = {
            HostName: hostName,
            GroupHeader: groupHeader,
            SortValue: sortValue,
            PageLocation: pageLocation,
            ContentItemNames: contentItemNames
        };

        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Adding new dynamic content group...</h2>' });
        me.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "DynamicContentGroup", saveData, function() {
            setTimeout(function () {
                jq.unblockUI();
                $modal.foundation('reveal', 'close');
                me.ReInitialize();
            }, 2500);
        }, me.CommonErrorHandler);
    }

    Modal_SaveExistingDynamicContentGroup($modal) {
        var id = this.$getNamedFieldWithinModal($modal, "ID").val();
        var etag = this.$getNamedFieldWithinModal($modal, "ETag").val();
        var objectRelativeLocation = this.$getNamedFieldWithinModal($modal, "RelativeLocation").val();
        var hostName = this.$getNamedFieldWithinModal($modal, "HostName").val();
        var groupHeader = this.$getNamedFieldWithinModal($modal, "GroupHeader").val();
        var sortValue = this.$getNamedFieldWithinModal($modal, "SortValue").val();
        var pageLocation = this.$getNamedFieldWithinModal($modal, "PageLocation").val();
        var contentItemNames = this.$getNamedFieldWithinModal($modal, "ContentItemNames").val();

        var saveData = {
            HostName: hostName,
            GroupHeader: groupHeader,
            SortValue: sortValue,
            PageLocation: pageLocation,
            ContentItemNames: contentItemNames
        };

        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Saving Dynamic Content Group...</h2>' });
        me.currOPM.SaveIndependentObject(id, objectRelativeLocation, etag, saveData, function() {
            setTimeout(function () {
                jq.unblockUI();
                $modal.foundation('reveal', 'close');
                me.ReInitialize();
            }, 2500);
        }, me.CommonErrorHandler);
    }


    Modal_SaveNewDynamicContent($modal) {
        var hostName = this.$getNamedFieldWithinModal($modal, "HostName").val();
        var contentName = this.$getNamedFieldWithinModal($modal, "ContentName").val();
        var elementQuery = this.$getNamedFieldWithinModal($modal, "ElementQuery").val();
        var editType = this.$getNamedFieldWithinModal($modal, "EditType").val();
        var pageLocation = this.$getNamedFieldWithinModal($modal, "PageLocation").val();
        var description = this.$getNamedFieldWithinModal($modal, "Description").val();
        var rawContent = this.$getNamedFieldWithinModal($modal, "RawContent").val();
        rawContent = $("<div/>").text(rawContent).html();
        var content = this.$getNamedFieldWithinModal($modal, "Content").val();
        content = $('<div/>').text(content).html();
        var applyActively = this.$getNamedFieldWithinModal($modal, "ApplyActively").is(':checked');

        var saveData = {
            HostName: hostName,
            ContentName: contentName,
            ElementQuery: elementQuery,
            EditType: editType,
            PageLocation: pageLocation,
            Description: description,
            "ENC.RawContent": rawContent,
            "ENC.Content": content,
            ApplyActively: applyActively
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
        var editType = this.$getNamedFieldWithinModal($modal, "EditType").val();
        var pageLocation = this.$getNamedFieldWithinModal($modal, "PageLocation").val();
        var description = this.$getNamedFieldWithinModal($modal, "Description").val();
        var rawContent = this.$getNamedFieldWithinModal($modal, "RawContent").val();
        rawContent = $("<div/>").text(rawContent).html();
        var content = this.$getNamedFieldWithinModal($modal, "Content").val();
        content = $('<div/>').text(content).html();
        var applyActively = this.$getNamedFieldWithinModal($modal, "ApplyActively").is(':checked');

        var saveData = {
            HostName: hostName,
            ContentName: contentName,
            ElementQuery: elementQuery,
            EditType: editType,
            PageLocation: pageLocation,
            Description: description,
            "ENC.RawContent": rawContent,
            "ENC.Content": content,
            ApplyActively: applyActively
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