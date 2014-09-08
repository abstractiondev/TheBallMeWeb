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
    var DynamicContentViewController = (function (_super) {
        __extends(DynamicContentViewController, _super);
        function DynamicContentViewController() {
            _super.apply(this, arguments);
        }
        DynamicContentViewController.prototype.ControllerInitialize = function () {
            var _this = this;
            var me = this;
            require([
                "DynamicContentView/DynamicContent_dust",
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
                "lib/dusts/modal_end_dust"], function (template) {
                me.currUDG.GetData(_this.dataUrl, function (data) {
                    me.currData = data;

                    //console.log("Init: " + dataUrl);
                    dust.render("DynamicContent.dust", data, function (error, output) {
                        if (error)
                            alert("DUST ERROR: " + error);
                        var $hostDiv = $("#" + me.divID);
                        $hostDiv.empty();
                        $hostDiv.html(output);
                        if (me.StateContent.LastActiveSection)
                            me.ActivateSection(me.StateContent.LastActiveSection);
                        $hostDiv.find(".oiphover-showlocation").hover(function () {
                            var $canvas = $hostDiv.find("canvas.oipdynamiccontentlocationview");
                            var canvas = $canvas[0];
                            me.DisplayLocation($(this), canvas);
                        }, function () {
                            me.ClearCanvas($(this));
                        });
                        $hostDiv.find(".oipcanvas-showlocation").each(function (index, element) {
                            var $canvas = $(this).find("canvas");
                            var canvas = $canvas[0];
                            me.DisplayLocation($(this), canvas);
                        });
                        me.ControllerInitializeDone();
                    });
                });
            });
        };

        DynamicContentViewController.prototype.VisibleTemplateRender = function () {
            //alert("Connections view ctrl visible render: " + this.divID);
        };

        DynamicContentViewController.prototype.InvisibleTemplateRender = function () {
            //alert("Connections view ctrl invisible render: " + this.divID);
        };

        DynamicContentViewController.prototype.ClearCanvas = function ($element) {
            var $hostDiv = $("#" + this.divID);
            var $canvas = $hostDiv.find("canvas.oipdynamiccontentlocationview");
            this.CurrentCanvas = $canvas[0];
            var canvas = this.CurrentCanvas;
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        DynamicContentViewController.prototype.DisplayLocation = function ($element, canvas) {
            var pageLocation = $element.attr("data-pagelocation");
            if (!pageLocation)
                return;
            var locations = pageLocation.split(";");
            if (locations.length != 4)
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
            ctx.lineWidth = 6;
            ctx.strokeStyle = "green";
            ctx.rect(startXCoord, startYCoord, rectWidth, rectHeight);
            ctx.stroke();
            //console.log("Drawn: " + startXCoord + " " + startYCoord + " " + endXCoord + " " + endYCoord);
        };

        DynamicContentViewController.prototype.SetActiveSection = function ($source) {
            var wnd = window;
            wnd.Foundation.libs.dropdown.close($("#drop-SelectDynamicContentPage"));
            var activatedSectionName = $source.attr("data-templatename");
            this.ActivateSection(activatedSectionName);
        };

        DynamicContentViewController.prototype.ActivateSection = function (sectionName) {
            this.$getSelectedFieldsWithin(".oipdynamiccontenteditorsection").hide();
            var $activeSection = this.$getNamedFieldWithin(sectionName);
            $activeSection.show();
            this.StateContent.LastActiveSection = sectionName;
        };

        DynamicContentViewController.prototype.OpenAddDynamicContentGroupModal = function () {
            var $modal = this.$getNamedFieldWithin("AddNewDynamicContentGroupModal");
            this.$getNamedFieldWithinModal($modal, "HostName").val("");
            this.$getNamedFieldWithinModal($modal, "GroupHeader").val("");
            this.$getNamedFieldWithinModal($modal, "SortValue").val("");
            this.$getNamedFieldWithinModal($modal, "PageLocation").val("");
            this.$getNamedFieldWithinModal($modal, "ContentItemNames").val("");
            $modal.foundation('reveal', 'open');
        };

        DynamicContentViewController.prototype.EditDynamicContentGroup = function ($source) {
            var $modal = this.$getNamedFieldWithin("EditDynamicContentGroupModal");
            var me = this;
            var jq = $;
            var wnd = window;
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
        };

        DynamicContentViewController.prototype.OpenAddDynamicContentModal = function () {
            var $modal = this.$getNamedFieldWithin("AddNewDynamicContentModal");
            this.$getNamedFieldWithinModal($modal, "HostName").val("");
            this.$getNamedFieldWithinModal($modal, "ContentName").val("");
            this.$getNamedFieldWithinModal($modal, "ElementQuery").val("");
            this.$getNamedFieldWithinModal($modal, "EditType").val("");
            this.$getNamedFieldWithinModal($modal, "PageLocation").val("");
            this.$getNamedFieldWithinModal($modal, "Description").val("");
            this.$getNamedFieldWithinModal($modal, "RawContent").val("");
            this.$getNamedFieldWithinModal($modal, "Content").val("");
            this.$getNamedFieldWithinModal($modal, "ApplyActively").prop("checked", false);
            var $content = this.$getNamedFieldWithinModal($modal, "Content");
            $content.destroyEditor();
            $content.val("");
            $content.redactor({
                minHeight: 300,
                maxHeight: 350,
                autoresize: false,
                buttons: ['bold', 'italic', 'alignment', 'unorderedlist', 'orderedlist', 'image', 'video', "link"]
            });
            $modal.foundation('reveal', 'open');
        };

        DynamicContentViewController.prototype.EditDynamicContent = function ($source) {
            var $modal = this.$getNamedFieldWithin("EditDynamicContentModal");
            var me = this;
            var jq = $;
            var wnd = window;
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
                var $content = me.$getNamedFieldWithinModal($modal, "Content");
                $content.destroyEditor();
                $content.val(contentData.Content);
                $content.redactor({
                    minHeight: 300,
                    maxHeight: 350,
                    autoresize: false,
                    buttons: ['bold', 'italic', 'alignment', 'unorderedlist', 'orderedlist', 'image', 'video', "link"]
                });
                $modal.foundation('reveal', 'open');
            });
        };

        DynamicContentViewController.prototype.ViewDynamicContent = function ($source) {
            var $modal = this.$getNamedFieldWithin("ViewDynamicContentModal");
            var me = this;
            var jq = $;
            var wnd = window;
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
                if (contentData.RawContent)
                    me.$getNamedFieldWithinModal($modal, "Content").html(contentData.RawContent);
                else
                    me.$getNamedFieldWithinModal($modal, "Content").html(contentData.Content);
                $modal.foundation('reveal', 'open');
            });
        };

        DynamicContentViewController.prototype.Modal_SaveNewDynamicContentGroup = function ($modal) {
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
            var jq = $;
            jq.blockUI({ message: '<h2>Adding new dynamic content group...</h2>' });
            me.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "DynamicContentGroup", saveData, function () {
                setTimeout(function () {
                    jq.unblockUI();
                    $modal.foundation('reveal', 'close');
                    me.ReInitialize();
                }, 2500);
            }, me.CommonErrorHandler);
        };

        DynamicContentViewController.prototype.Modal_SaveExistingDynamicContentGroup = function ($modal) {
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
            var jq = $;
            jq.blockUI({ message: '<h2>Saving Dynamic Content Group...</h2>' });
            me.currOPM.SaveIndependentObject(id, objectRelativeLocation, etag, saveData, function () {
                setTimeout(function () {
                    jq.unblockUI();
                    $modal.foundation('reveal', 'close');
                    me.ReInitialize();
                }, 2500);
            }, me.CommonErrorHandler);
        };

        DynamicContentViewController.prototype.Modal_SaveNewDynamicContent = function ($modal) {
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
            var jq = $;
            jq.blockUI({ message: '<h2>Adding new dynamic content...</h2>' });
            me.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "DynamicContent", saveData, function () {
                setTimeout(function () {
                    jq.unblockUI();
                    $modal.foundation('reveal', 'close');
                    me.ReInitialize();
                }, 2500);
            }, me.CommonErrorHandler);
        };

        DynamicContentViewController.prototype.Modal_SaveExistingDynamicContent = function ($modal) {
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
            var jq = $;
            jq.blockUI({ message: '<h2>Saving Dynamic Content...</h2>' });
            me.currOPM.SaveIndependentObject(id, objectRelativeLocation, etag, saveData, function () {
                setTimeout(function () {
                    jq.unblockUI();
                    $modal.foundation('reveal', 'close');
                    me.ReInitialize();
                }, 2500);
            }, me.CommonErrorHandler);
        };

        DynamicContentViewController.prototype.DeleteObject = function ($source) {
            var id = $source.data("objectid");
            var domainName = $source.data("domainname");
            var objectName = $source.data("objectname");
            var me = this;
            var jq = $;
            jq.blockUI({ message: '<h2>Deleting...</h2>' });
            this.currOPM.DeleteIndependentObject(domainName, objectName, id, function (responseData) {
                setTimeout(function () {
                    jq.unblockUI();
                    me.ReInitialize();
                }, 2500);
            });
        };
        return DynamicContentViewController;
    })(ViewControllerBase);

    
    return DynamicContentViewController;
});
