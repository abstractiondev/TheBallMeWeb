/**
* Created by kalle on 4.8.2014.
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../ViewControllerBase"], function(require, exports, ViewControllerBase) {
    var FileManagerViewController = (function (_super) {
        __extends(FileManagerViewController, _super);
        function FileManagerViewController() {
            _super.apply(this, arguments);
            this.DropBoxOptions = {
                // Required. Called when a user selects an item in the Chooser.
                success: function (files) {
                    alert("Here's the file link: " + files[0].link);
                },
                // Optional. Called when the user closes the dialog without selecting a file
                // and does not include any parameters.
                cancel: function () {
                },
                // Optional. "preview" (default) is a preview link to the document for sharing,
                // "direct" is an expiring link to download the contents of the file. For more
                // information about link types, see Link types below.
                linkType: "preview",
                // Optional. A value of false (default) limits selection to a single file, while
                // true enables multiple file selection.
                multiselect: false
            };
            this.currUploaded = 0;
        }
        FileManagerViewController.prototype.ControllerInitialize = function () {
            var _this = this;
            var me = this;
            require([
                "FileManagerView/FileManager_dust",
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
                "lib/dusts/modal_end_dust"], function (template) {
                me.currUDG.GetData(_this.dataUrl, function (data) {
                    me.currData = data;

                    //console.log("Init: " + dataUrl);
                    dust.render("FileManager.dust", data, function (error, output) {
                        if (error)
                            alert("DUST ERROR: " + error);
                        var $hostDiv = $("#" + me.divID);
                        $hostDiv.empty();
                        $hostDiv.html(output);
                        var $fileInput = me.$getNamedFieldWithin("FileInput");
                        me.setFileInputEvent($fileInput);

                        //me.initDropboxChooser();
                        //me.initVideoUpload();
                        var nav = navigator;
                        nav.getUserMedia = (nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia || nav.msGetUserMedia);
                        me.hasUserMedia = nav.getUserMedia;
                        if (!me.hasUserMedia)
                            me.$getNamedFieldWithin("bAddNewVideo").hide();
                        me.ControllerInitializeDone();
                    });
                });
            });
        };

        FileManagerViewController.prototype.initDropboxChooser = function () {
            var me = this;
            var $dropboxContainer = me.$getNamedFieldWithin("DropboxChooseContainer");
            var wnd = window;
            var dbox = wnd.Dropbox;
            var dropboxButton = dbox.createChooseButton(me.DropBoxOptions);
            $dropboxContainer.append(dropboxButton);
        };

        FileManagerViewController.prototype.setFileInputEvent = function ($fileInput) {
            var me = this;
            var changeEventName = "change";
            $fileInput.off(changeEventName).on(changeEventName, function () {
                var input = this;
                me.currUploaded = 0;
                var jq = $;
                jq.blockUI({ message: '<h2>Uploading Files...</h2>' });
                if (input.files && input.files[0]) {
                    var totalCount = input.files.length;
                    var totalReadCount = 0;
                    for (var i = 0; i < input.files.length; i++) {
                        (function (index) {
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
        };

        FileManagerViewController.prototype.endsWith = function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        };

        FileManagerViewController.prototype.UploadFile = function (fileName, fileContent, currentReadCount, totalCount) {
            var me = this;
            var fileNameLC = fileName.toLowerCase();
            var fileSaveData = {};
            var domainName = "AaltoGlobalImpact.OIP";
            var objectName = "";
            if (me.endsWith(fileNameLC, ".jpg") || me.endsWith(fileNameLC, ".gif") || me.endsWith(fileNameLC, ".png") || me.endsWith(fileNameLC, ".jpeg")) {
                objectName = "Image";
                fileSaveData = {
                    "FileEmbedded_ImageData": fileName + ":" + fileContent,
                    "Title": fileName
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
            var jq = $;
            me.currOPM.CreateObjectAjax(domainName, objectName, fileSaveData, function () {
                //alert("Created: " + fileName + " " + currentReadCount + " " + totalCount);
                me.currUploaded++;
                if (me.currUploaded == totalCount) {
                    setTimeout(function () {
                        jq.unblockUI();
                        me.ReInitialize();
                    }, 2500);
                }
            }, me.CommonErrorHandler);
        };

        FileManagerViewController.prototype.VisibleTemplateRender = function () {
            var me = this;
            $.when(this.DoneInitializedPromise()).then(function () {
            });
        };

        FileManagerViewController.prototype.initVideoUpload = function () {
            var nav = navigator;
            var wnd = window;
            var me = this;
            nav.getUserMedia = (nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia || nav.msGetUserMedia);
            console.log("Nav check: " + nav.getUserMedia);
            if (nav.getUserMedia) {
                var errorCallback = function (e) {
                    console.log('Reeeejected!', e);
                };

                /* Not showing vendor prefixes.*/
                nav.getUserMedia({
                    video: true,
                    audio: true
                }, function (localMediaStream) {
                    var video = document.querySelector('video');
                    me.activeVideo = video;
                    me.activeStream = localMediaStream;
                    video.src = wnd.URL.createObjectURL(localMediaStream);
                    /* Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
                    See crbug.com/110938.*/
                    /*
                    video.onloadedmetadata = function(e) {
                    };
                    */
                }, errorCallback);
            }
        };

        FileManagerViewController.prototype.Modal_RecordVideo = function ($modal) {
            var me = this;
            me.initVideoUpload();
        };

        FileManagerViewController.prototype.stopActiveVideo = function () {
            var me = this;
            if (me.activeStream) {
                me.activeStream.stop();
            }
            if (me.activeVideo) {
                me.activeVideo.pause();
                me.activeVideo.src = "";
            }
        };

        FileManagerViewController.prototype.Modal_StopRecording = function ($modal) {
            var me = this;
            me.stopActiveVideo();
        };

        FileManagerViewController.prototype.Modal_SaveVideoContent = function ($modal) {
            var me = this;
            me.stopActiveVideo();
        };

        FileManagerViewController.prototype.Modal_CloseVideoModal = function ($modal) {
            var me = this;
            me.stopActiveVideo();
            $modal.foundation("reveal", "close");
        };

        FileManagerViewController.prototype.AddNewVideo = function ($source) {
            var me = this;
            var $modal = this.$getNamedFieldWithin("RecordAndEditVideoModal");
            var currentID = "";
            var currentETag = "";
            var currentRelativeLocation = "";
            var currentTitle = "";
            var currentDescription = "";
            me.$getNamedFieldWithinModal($modal, "ID").val(currentID);
            me.$getNamedFieldWithinModal($modal, "ETag").val(currentETag);
            me.$getNamedFieldWithinModal($modal, "RelativeLocation").val(currentRelativeLocation);
            me.$getNamedFieldWithinModal($modal, "Title").val(currentTitle);
            me.$getNamedFieldWithinModal($modal, "Description").val(currentDescription);
            var $categoriesSelect = me.$getNamedFieldWithinModal($modal, "Categories");
            $categoriesSelect.empty();
            $modal.foundation('reveal', 'open');
        };

        FileManagerViewController.prototype.EditBinaryFile = function ($source) {
            var objectID = $source.attr("data-objectid");
            var fetchDataUrl = "../../AaltoGlobalImpact.OIP/BinaryFile/" + objectID + ".json";
            var thumbnailImageUrl = "../assets/controlpanel/images/lightGray.jpg";
            this.EditBinaryOrImageFile(objectID, fetchDataUrl, thumbnailImageUrl);
        };

        FileManagerViewController.prototype.EditImageFile = function ($source) {
            var objectID = $source.attr("data-objectid");
            var fetchDataUrl = "../../AaltoGlobalImpact.OIP/Image/" + objectID + ".json";
            var currentObject = this.getObjectByID(this.currData.ImageFiles.CollectionContent, objectID);

            //var imageSizeString = 128;
            var thumbnailImageUrl = "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_640x480_crop" + currentObject.ImageData.AdditionalFormatFileExt;
            this.EditBinaryOrImageFile(objectID, fetchDataUrl, thumbnailImageUrl);
        };

        FileManagerViewController.prototype.EditBinaryOrImageFile = function (objectID, fetchDataUrl, thumbnailImageUrl) {
            var me = this;
            var jq = $;
            var wnd = window;
            var $modal = this.$getNamedFieldWithin("EditBinaryAndImageFileModal");
            $.getJSON(fetchDataUrl, function (contentData) {
                var currentObject = contentData;
                var currentID = currentObject.ID;
                var currentETag = currentObject.MasterETag;
                var currentRelativeLocation = currentObject.RelativeLocation;
                var currentTitle = currentObject.Title;
                var currentDescription = currentObject.Description;

                var selectedCategories = [];
                if (currentObject.Categories && currentObject.Categories.CollectionContent) {
                    for (var categoryIX = 0; categoryIX < currentObject.Categories.CollectionContent.length; categoryIX++) {
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
        };

        FileManagerViewController.prototype.Modal_SaveExistingContent = function ($modal) {
            var id = this.$getNamedFieldWithinModal($modal, "ID").val();
            var etag = this.$getNamedFieldWithinModal($modal, "ETag").val();
            var objectRelativeLocation = this.$getNamedFieldWithinModal($modal, "RelativeLocation").val();
            var title = this.$getNamedFieldWithinModal($modal, "Title").val();
            var description = this.$getNamedFieldWithinModal($modal, "Description").val();
            var categories = this.$getNamedFieldWithinModal($modal, "Categories").val();

            var saveData = {
                Title: title,
                Description: description,
                Object_Categories: categories
            };

            var me = this;
            var jq = $;
            jq.blockUI({ message: '<h2>Saving content...</h2>' });
            me.currOPM.SaveIndependentObject(id, objectRelativeLocation, etag, saveData, function () {
                setTimeout(function () {
                    jq.unblockUI();
                    $modal.foundation('reveal', 'close');
                    me.ReInitialize();
                }, 2500);
            }, me.CommonErrorHandler);
        };

        FileManagerViewController.prototype.DeleteObject = function ($this) {
            var id = $this.attr("data-objectid");
            var domainName = $this.attr("data-domainname");
            var objectName = $this.attr("data-objectname");
            var me = this;
            var jq = $;
            jq.blockUI({ message: '<h2>Deleting Content...</h2>' });
            this.currOPM.DeleteIndependentObject(domainName, objectName, id, function (responseData) {
                setTimeout(function () {
                    jq.unblockUI();
                    me.ReInitialize();
                }, 2500);
            });
        };
        return FileManagerViewController;
    })(ViewControllerBase);

    
    return FileManagerViewController;
});
