/**
 * Created by kalle on 4.8.2014.
 */


/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />


import ViewControllerBase = require("../ViewControllerBase");

class FileManagerViewController extends ViewControllerBase {

    currData:any;

    ControllerInitialize():void {
        var me = this;
        require(["FileManagerView/FileManager_dust",
            "FileManagerView/Filelist_dust",
            "FileManagerView/FileUploadPanel_dust",
            "FileManagerView/FileManagerModals_dust",
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
                dust.render("FileManager.dust", data, (error, output) => {
                    if(error)
                        alert("DUST ERROR: " + error);
                    var $hostDiv = $("#" + me.divID);
                    $hostDiv.empty();
                    $hostDiv.html(output);
                    var $fileInput = me.$getNamedFieldWithin("FileInput");
                    me.setFileInputEvent($fileInput);
                    me.ControllerInitializeDone();
                });
            });
        });
    }

    currUploaded = 0;
    setFileInputEvent($fileInput) {
        var me = this;
        var changeEventName = "change";
        $fileInput.off(changeEventName).on(changeEventName, function() {
            var input:HTMLInputElement = <HTMLInputElement>this;
            me.currUploaded = 0;
            var jq:any = $;
            jq.blockUI({ message: '<h2>Uploading Files...</h2>' });
            if (input.files && input.files[0]) {
                var totalCount = input.files.length;
                var totalReadCount = 0;
                for(var i = 0; i < input.files.length; i++) {
                    (function(index) {
                        //var currFile = input.files[i];
                        var reader = new FileReader();
                        var fileName = input.files[index].name;
                        reader.onload = function (e) {
                            //alert(input.files[0].name);
                            var currReadCount = ++totalReadCount;
                            me.UploadFile(fileName, e.target.result, currReadCount, totalCount);
                            //me.setPreviewImageSrc($imagePreview, e.target.result);
                        };
                        reader.readAsDataURL(input.files[index]);

                    })(i);
                }
            }
        });
    }

    endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    UploadFile(fileName:string, fileContent:string, currentReadCount:number, totalCount:number ) {
        var me = this;
        var fileNameLC = fileName.toLowerCase();
        var fileSaveData = {};
        var domainName = "AaltoGlobalImpact.OIP";
        var objectName:string = "";
        if(me.endsWith(fileNameLC, ".jpg") ||
            me.endsWith(fileNameLC, ".gif") ||
            me.endsWith(fileNameLC, ".png") ||
            me.endsWith(fileNameLC, ".jpeg")) {
            objectName = "Image";
            fileSaveData = {
                "FileEmbedded_ImageData": fileName + ":" + fileContent,
                "Title": fileName,
            };
        } else {
            fileSaveData = {
                "FileEmbedded_Data": fileName + ":" + fileContent,
                "Title": fileName,
                "OriginalFileName": fileName
            };
            objectName = "BinaryFile";

        }
        //alert(fileName + " " + currentReadCount + " " + totalCount);
        var jq:any = $;
        me.currOPM.CreateObjectAjax(domainName, objectName, fileSaveData,
            function() {
                //alert("Created: " + fileName + " " + currentReadCount + " " + totalCount);
                me.currUploaded++;
                if(me.currUploaded == totalCount) {
                    setTimeout(function() {
                        jq.unblockUI();
                        me.ReInitialize();
                    }, 2500);
                }
            }, me.CommonErrorHandler);
    }

    VisibleTemplateRender() {
        var me = this;
        $.when(this.DoneInitializedPromise()).then(function() {
        });
    }

    EditBinaryFile($source) {
        var objectID = $source.attr("data-objectid");
        var fetchDataUrl = "../../AaltoGlobalImpact.OIP/BinaryFile/" + objectID + ".json";
        var thumbnailImageUrl = "../assets/controlpanel/images/lightGray.jpg";
        this.EditBinaryOrImageFile(objectID, fetchDataUrl, thumbnailImageUrl);
    }

    EditImageFile($source) {
        var objectID = $source.attr("data-objectid");
        var fetchDataUrl = "../../AaltoGlobalImpact.OIP/Image/" + objectID + ".json";
        var currentObject = this.getObjectByID(this.currData.ImageFiles.CollectionContent, objectID);
        //var imageSizeString = 128;
        var thumbnailImageUrl = "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_640x480_crop" + currentObject.ImageData.AdditionalFormatFileExt
        this.EditBinaryOrImageFile(objectID, fetchDataUrl, thumbnailImageUrl);
    }

    EditBinaryOrImageFile(objectID, fetchDataUrl, thumbnailImageUrl) {
        var me = this;
        var jq:any = $;
        var wnd:any = window;
        var $modal:any = this.$getNamedFieldWithin("EditBinaryAndImageFileModal");
        $.getJSON(fetchDataUrl, function (contentData) {
            var currentObject = contentData;
            var currentID = currentObject.ID;
            var currentETag = currentObject.MasterETag;
            var currentRelativeLocation = currentObject.RelativeLocation;
            var currentTitle = currentObject.Title;
            var currentDescription = currentObject.Description;

            var selectedCategories = [];
            if(currentObject.Categories && currentObject.Categories.CollectionContent) {
                for(var categoryIX = 0; categoryIX < currentObject.Categories.CollectionContent.length; categoryIX++) {
                    var item = currentObject.Categories.CollectionContent[categoryIX];
                    //me.CategoriesListed += item.ID + ",";
                    selectedCategories.push(item.ID);
                }
            }

            var categoryoptions = "<option value=''>(None)</option>";
            for (var i in me.currData.Categories.CollectionContent) {
                var categoryObject = me.currData.Categories.CollectionContent[i];
                var categoryID = categoryObject.ID;
                var categoryTitle = categoryObject.Title ? categoryObject.Title : "";
                categoryoptions += "<option value='" + categoryID + "'>" + categoryTitle + "</option>";
            }
            var $categoriesSelect = me.$getNamedFieldWithinModal($modal, "Categories");
            $categoriesSelect.empty();
            $categoriesSelect.append(categoryoptions);
            $categoriesSelect.val(selectedCategories);

            // Image support content initiation
            var imageSizeString = "256";
            /*var currentImagePath = currentObject.ImageData
                ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
                : null;
                */
            me.$getNamedFieldWithinModal($modal, "ThumbnailImage").attr("src", thumbnailImageUrl);

            me.$getNamedFieldWithinModal($modal, "ID").val(currentID);
            me.$getNamedFieldWithinModal($modal, "ETag").val(currentETag);
            me.$getNamedFieldWithinModal($modal, "RelativeLocation").val(currentRelativeLocation);
            me.$getNamedFieldWithinModal($modal, "Title").val(currentTitle);
            me.$getNamedFieldWithinModal($modal, "Description").val(currentDescription);
            $modal.foundation('reveal', 'open');
        });
    }

    Modal_SaveExistingContent($modal) {
        var id = this.$getNamedFieldWithinModal($modal, "ID").val();
        var etag = this.$getNamedFieldWithinModal($modal, "ETag").val();
        var objectRelativeLocation = this.$getNamedFieldWithinModal($modal, "RelativeLocation").val();
        var title = this.$getNamedFieldWithinModal($modal, "Title").val();
        var description = this.$getNamedFieldWithinModal($modal, "Description").val();
        var categories = this.$getNamedFieldWithinModal($modal, "Categories").val();

        var saveData =
        {
            Title: title,
            Description: description,
            Object_Categories: categories,
        };

        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Saving content...</h2>' });
        me.currOPM.SaveIndependentObject(id, objectRelativeLocation, etag, saveData, function() {
            setTimeout(function () {
                jq.unblockUI();
                $modal.foundation('reveal', 'close');
                me.ReInitialize();
            }, 2500);
        }, me.CommonErrorHandler);
    }


    DeleteObject($this)
    {
        var id = $this.attr("data-objectid");
        var domainName = $this.attr("data-domainname");
        var objectName = $this.attr("data-objectname");
        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Deleting Content...</h2>' });
        this.currOPM.DeleteIndependentObject(domainName, objectName, id, function(responseData) {
            setTimeout(function() {
                jq.unblockUI();
                me.ReInitialize();
            }, 2500);
        });
    }


}

export = FileManagerViewController;