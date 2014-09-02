/**
* Created by kalle on 14.6.2014.
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../ViewControllerBase"], function(require, exports, ViewControllerBase) {
    var MainContentViewController = (function (_super) {
        __extends(MainContentViewController, _super);
        function MainContentViewController() {
            _super.apply(this, arguments);
        }
        MainContentViewController.prototype.ControllerInitialize = function () {
            var _this = this;
            var me = this;
            var wnd = window;
            require([
                "MainContentView/MainContent_dust",
                "MainContentView/Modals_dust",
                "MainContentView/TextContent_Modals_dust",
                "MainContentView/LinkToContent_Modals_dust",
                "MainContentView/EmbeddedContent_Modals_dust",
                "lib/dusts/command_button_dust",
                "lib/dusts/command_icon_dust",
                "lib/dusts/insidemodal_button_dust",
                "lib/dusts/hiddeninput_dust",
                "lib/dusts/openmodal_button_dust",
                "lib/dusts/modal_begin_dust",
                "lib/dusts/modal_end_dust",
                "MainContentView/ImportantLinks_dust",
                "MainContentView/MainContent"], function (template) {
                wnd.getAttachments();
                wnd.getBinaries();
                me.currUDG.GetData(_this.dataUrl, function (data) {
                    me.currData = data;
                    dust.render("MainContent.dust", data, function (error, output) {
                        if (error)
                            alert("DUST ERROR: " + error);
                        var $hostDiv = $("#" + me.divID);
                        $hostDiv.empty();
                        $hostDiv.html(output);
                        me.ControllerInitializeDone();
                    });
                });
            });
            /*
            require(["GroupInfoView/GroupInfo_dust"], (template) => {
            dust.render("GroupInfo.dust", {
            }, (error, output) =>  {
            var $hostDiv = $("#" + me.divID);
            $hostDiv.empty();
            $hostDiv.html(output);
            me.ControllerInitializeDone();
            });
            });*/
        };

        MainContentViewController.prototype.VisibleTemplateRender = function () {
            var me = this;
            $.when(this.DoneInitializedPromise()).then(function () {
                $(document).ready(function () {
                    var wnd = window;
                    wnd.initializeAll();
                    wnd.initializeContent(me.currData.TextContents, me.currData.LinkToContents, me.currData.EmbeddedContents, me.currData.Comments);
                    wnd.start_isotope();
                    wnd.reLayout_isotope();
                    setInterval(wnd.reLayout_isotope, 2000);
                });
            });
        };

        /*
        function getAndPopulateCategoryOptions() {
        $.getJSON('../../AaltoGlobalImpact.OIP/CategoryCollection/MasterCollection.json', function (contentData) {
        var categoryoptions = "";
        for (var i in contentData.CollectionContent) {
        var currentObject = contentData.CollectionContent[i];
        var currentID = currentObject.ID;
        var currentTitle = currentObject.Title ? currentObject.Title : "";
        categoryoptions += "<option value='" + currentID + "'>" + currentTitle + "</option>";
        }//ends FOR loop
        $("#addNewContentCategorySelect").empty();
        $("#addNewContentCategorySelect").append(categoryoptions);
        $("#editContentModal-categories").empty();
        $("#editContentModal-categories").append(categoryoptions);
        return false;
        })//ends getJson
        }*/
        MainContentViewController.prototype.EditLinkToContent = function ($source) {
            var $modal = this.$getNamedFieldWithin("EditLinkToContentModal");
            var me = this;
            var jq = $;
            var wnd = window;
            var clickedEditID = $source.attr("data-objectid");
            $.getJSON('../../AaltoGlobalImpact.OIP/LinkToContent/' + clickedEditID + ".json", function (contentData) {
                //tDCM.SetObjectInStorage(contentData);
                var currentObject = contentData;
                var currentID = currentObject.ID;
                var currentETag = currentObject.MasterETag;
                var currentRelativeLocation = currentObject.RelativeLocation;
                var currentURL = currentObject.URL;
                var currentTitle = currentObject.Title;
                var currentDescription = currentObject.Description;
                var currentAuthor = currentObject.Author;
                var currentPublishedDate = wnd.ParseRawTimestampToISOString(currentObject.Published);

                var selectedCategories = [];
                if (currentObject.Categories && currentObject.Categories.CollectionContent) {
                    for (var categoryIX = 0; categoryIX < currentObject.Categories.CollectionContent.length; categoryIX++) {
                        var item = currentObject.Categories.CollectionContent[categoryIX];
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
                var currentImagePath = currentObject.ImageData ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt : null;

                // Initiate binary file elements for image
                var noImageUrl = "../assets/controlpanel/images/lightGray.jpg";
                var $imageDataFileInput = me.$getNamedFieldWithinModal($modal, "ImageDataFileInput");
                $imageDataFileInput.attr("data-oipfile-filegroupid", "editModal");
                me.currOPM.InitiateBinaryFileElementsAroundInput($imageDataFileInput, currentID, "ImageData", currentImagePath, noImageUrl);

                me.$getNamedFieldWithinModal($modal, "ID").val(currentID);
                me.$getNamedFieldWithinModal($modal, "ETag").val(currentETag);
                me.$getNamedFieldWithinModal($modal, "RelativeLocation").val(currentRelativeLocation);
                me.$getNamedFieldWithinModal($modal, "URL").val(currentURL);
                me.$getNamedFieldWithinModal($modal, "Title").val(currentTitle);
                me.$getNamedFieldWithinModal($modal, "Description").val(currentDescription);
                me.$getNamedFieldWithinModal($modal, "Published").val(currentPublishedDate);
                me.$getNamedFieldWithinModal($modal, "Author").val(currentAuthor);
                $modal.foundation('reveal', 'open');
            }); //ends getJson
        };

        MainContentViewController.prototype.OpenModalAddLinkToContentModal = function () {
            var wnd = window;
            wnd.Foundation.libs.dropdown.close($("#drop-PostAndPublish"));
            var $modal = this.$getNamedFieldWithin("AddLinkToContentModal");
            var me = this;
            this.$getNamedFieldWithinModal($modal, "URL").val("");
            this.$getNamedFieldWithinModal($modal, "Title").val("");
            this.$getNamedFieldWithinModal($modal, "Description").val("");
            this.$getNamedFieldWithinModal($modal, "Author").val("");
            var currentPublished = wnd.ParseRawTimestampToISOString(null);
            this.$getNamedFieldWithinModal($modal, "Published").val(currentPublished);

            var categoryoptions = "<option value=''>(None)</option>";
            for (var i in this.currData.Categories.CollectionContent) {
                var categoryObject = me.currData.Categories.CollectionContent[i];
                var categoryID = categoryObject.ID;
                var categoryTitle = categoryObject.Title ? categoryObject.Title : "";
                categoryoptions += "<option value='" + categoryID + "'>" + categoryTitle + "</option>";
            }
            var $categoriesSelect = this.$getNamedFieldWithinModal($modal, "Categories");
            $categoriesSelect.empty();
            $categoriesSelect.append(categoryoptions);

            var $newupdatefileinput = this.$getNamedFieldWithinModal($modal, "ImageData");
            $newupdatefileinput.replaceWith($newupdatefileinput = $newupdatefileinput.clone(true));

            var $imageDataInput = this.$getNamedFieldWithinModal($modal, "ImageData");
            $imageDataInput.attr("data-oipfile-filegroupid", "imageDataImage");
            this.currOPM.InitiateBinaryFileElementsAroundInput($imageDataInput, "000", "ImageData", null, "../assets/controlpanel/images/lightGray.jpg");
            $modal.foundation('reveal', 'open');
        };

        MainContentViewController.prototype.ViewLinkToContent = function ($source) {
            var $modal = this.$getNamedFieldWithin("ViewLinkToContentModal");
            var me = this;
            var jq = $;
            var wnd = window;
            var clickedEditID = $source.attr("data-oip-command-args");
            $.getJSON('../../AaltoGlobalImpact.OIP/LinkToContent/' + clickedEditID + ".json", function (contentData) {
                //tDCM.SetObjectInStorage(contentData);
                var currentObject = contentData;
                var currentURL = currentObject.URL;
                var currentTitle = currentObject.Title;
                var currentDescription = currentObject.Description;
                var currentAuthor = currentObject.Author;
                var currentPublishedDate = wnd.ParseRawTimestampToDateString(currentObject.Published);

                var selectedCategories = [];
                if (currentObject.Categories && currentObject.Categories.CollectionContent) {
                    for (var categoryIX = 0; categoryIX < currentObject.Categories.CollectionContent.length; categoryIX++) {
                        var item = currentObject.Categories.CollectionContent[categoryIX];
                        selectedCategories.push(item.ID);
                    }
                }

                // Image support content initiation
                var imageSizeString = "256";
                var currentImagePath = currentObject.ImageData ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt : "../assets/controlpanel/images/lightGray.jpg";

                // Initiate binary file elements for image
                me.$getNamedFieldWithinModal($modal, "ImageData").attr("src", currentImagePath);
                me.$getNamedFieldWithinModal($modal, "LinkToURL").html(currentURL);
                me.$getNamedFieldWithinModal($modal, "LinkToURL").attr("href", currentURL);
                me.$getNamedFieldWithinModal($modal, "Title").html(currentTitle);
                me.$getNamedFieldWithinModal($modal, "Description").html(currentDescription);
                me.$getNamedFieldWithinModal($modal, "Published").html(currentPublishedDate);
                me.$getNamedFieldWithinModal($modal, "Author").html(currentAuthor);
                $modal.foundation('reveal', 'open');
            }); //ends getJson
        };

        MainContentViewController.prototype.ViewEmbeddedContent = function ($source) {
        };

        MainContentViewController.prototype.EditEmbeddedContent = function ($source) {
            var $modal = this.$getNamedFieldWithin("EditEmbeddedContentModal");
            var me = this;
            var jq = $;
            var wnd = window;
            var clickedEditID = $source.attr("data-objectid");
            $.getJSON('../../AaltoGlobalImpact.OIP/EmbeddedContent/' + clickedEditID + ".json", function (contentData) {
                //tDCM.SetObjectInStorage(contentData);
                var currentObject = contentData;
                var currentID = currentObject.ID;
                var currentETag = currentObject.MasterETag;
                var currentRelativeLocation = currentObject.RelativeLocation;
                var currentIFrameTagContents = currentObject.IFrameTagContents;
                var currentTitle = currentObject.Title;
                var currentDescription = currentObject.Description;
                var currentAuthor = currentObject.Author;
                var currentPublishedDate = wnd.ParseRawTimestampToISOString(currentObject.Published);

                var selectedCategories = [];
                if (currentObject.Categories && currentObject.Categories.CollectionContent) {
                    for (var categoryIX = 0; categoryIX < currentObject.Categories.CollectionContent.length; categoryIX++) {
                        var item = currentObject.Categories.CollectionContent[categoryIX];
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

                me.$getNamedFieldWithinModal($modal, "ID").val(currentID);
                me.$getNamedFieldWithinModal($modal, "ETag").val(currentETag);
                me.$getNamedFieldWithinModal($modal, "RelativeLocation").val(currentRelativeLocation);
                me.$getNamedFieldWithinModal($modal, "IFrameTagContents").val(currentIFrameTagContents);
                me.$getNamedFieldWithinModal($modal, "Title").val(currentTitle);
                me.$getNamedFieldWithinModal($modal, "Description").val(currentDescription);
                me.$getNamedFieldWithinModal($modal, "Published").val(currentPublishedDate);
                me.$getNamedFieldWithinModal($modal, "Author").val(currentAuthor);
                $modal.foundation('reveal', 'open');
            }); //ends getJson
        };

        MainContentViewController.prototype.OpenPreviewOnNewTab = function () {
            var wnd = window;
            wnd.Foundation.libs.dropdown.close($("#drop-PostAndPublish"));
            window.open("../../wwwsite/html/index.html");
        };

        MainContentViewController.prototype.OpenModalAddEmbeddedContentModal = function () {
            var wnd = window;
            wnd.Foundation.libs.dropdown.close($("#drop-PostAndPublish"));
            var $modal = this.$getNamedFieldWithin("AddEmbeddedContentModal");
            var me = this;
            this.$getNamedFieldWithinModal($modal, "IFrameTagContents").val("");
            this.$getNamedFieldWithinModal($modal, "Title").val("");
            this.$getNamedFieldWithinModal($modal, "Description").val("");
            this.$getNamedFieldWithinModal($modal, "Author").val("");
            var currentPublished = wnd.ParseRawTimestampToISOString(null);
            this.$getNamedFieldWithinModal($modal, "Published").val(currentPublished);

            var categoryoptions = "<option value=''>(None)</option>";
            for (var i in this.currData.Categories.CollectionContent) {
                var categoryObject = me.currData.Categories.CollectionContent[i];
                var categoryID = categoryObject.ID;
                var categoryTitle = categoryObject.Title ? categoryObject.Title : "";
                categoryoptions += "<option value='" + categoryID + "'>" + categoryTitle + "</option>";
            }
            var $categoriesSelect = this.$getNamedFieldWithinModal($modal, "Categories");
            $categoriesSelect.empty();
            $categoriesSelect.append(categoryoptions);

            $modal.foundation('reveal', 'open');
        };

        MainContentViewController.prototype.Modal_SaveNewLinkToContent = function ($modal) {
            var url = this.$getNamedFieldWithinModal($modal, "URL").val();
            var title = this.$getNamedFieldWithinModal($modal, "Title").val();
            var description = this.$getNamedFieldWithinModal($modal, "Description").val();
            var categories = this.$getNamedFieldWithinModal($modal, "Categories").val();
            var published = this.$getNamedFieldWithinModal($modal, "Published").val();
            var author = this.$getNamedFieldWithinModal($modal, "Author").val();

            var saveData = {
                Title: title,
                URL: url,
                Description: description,
                Published: published,
                Author: author,
                Object_Categories: categories
            };

            var me = this;
            var jq = $;
            this.currOPM.AppendBinaryFileValuesToData("000", saveData, function () {
                jq.blockUI({ message: '<h2>Adding new content...</h2><br>(If no image was given, fetching thumbnail image will take around 30 seconds)' });
                me.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "LinkToContent", saveData, function () {
                    setTimeout(function () {
                        jq.unblockUI();
                        $modal.foundation('reveal', 'close');
                        me.ReInitialize();
                    }, 4000);
                }, me.CommonErrorHandler);
            });
        };

        MainContentViewController.prototype.Modal_SaveNewEmbeddedContent = function ($modal) {
            var iFrameTagContents = this.$getNamedFieldWithinModal($modal, "IFrameTagContents").val();
            var title = this.$getNamedFieldWithinModal($modal, "Title").val();
            var description = this.$getNamedFieldWithinModal($modal, "Description").val();
            var categories = this.$getNamedFieldWithinModal($modal, "Categories").val();
            var published = this.$getNamedFieldWithinModal($modal, "Published").val();
            var author = this.$getNamedFieldWithinModal($modal, "Author").val();

            var saveData = {
                Title: title,
                IFrameTagContents: iFrameTagContents,
                Description: description,
                Published: published,
                Author: author,
                Object_Categories: categories
            };

            var me = this;
            var jq = $;
            jq.blockUI({ message: '<h2>Saving content...</h2>' });
            me.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "EmbeddedContent", saveData, function () {
                setTimeout(function () {
                    jq.unblockUI();
                    $modal.foundation('reveal', 'close');
                    me.ReInitialize();
                }, 2500);
            }, me.CommonErrorHandler);
        };

        MainContentViewController.prototype.Modal_SaveExistingLinkToContent = function ($modal) {
            var id = this.$getNamedFieldWithinModal($modal, "ID").val();
            var etag = this.$getNamedFieldWithinModal($modal, "ETag").val();
            var objectRelativeLocation = this.$getNamedFieldWithinModal($modal, "RelativeLocation").val();
            var url = this.$getNamedFieldWithinModal($modal, "URL").val();
            var title = this.$getNamedFieldWithinModal($modal, "Title").val();
            var published = this.$getNamedFieldWithinModal($modal, "Published").val();
            var author = this.$getNamedFieldWithinModal($modal, "Author").val();
            var description = this.$getNamedFieldWithinModal($modal, "Description").val();
            var categories = this.$getNamedFieldWithinModal($modal, "Categories").val();

            var saveData = {
                Title: title,
                URL: url,
                Description: description,
                Published: published,
                Author: author,
                Object_Categories: categories
            };

            var me = this;
            var jq = $;
            this.currOPM.AppendBinaryFileValuesToData(id, saveData, function () {
                jq.blockUI({ message: '<h2>Saving Link To Content...</h2><br>(If no image was given, fetching thumbnail image will take around 30 seconds)' });
                me.currOPM.SaveIndependentObject(id, objectRelativeLocation, etag, saveData, function () {
                    setTimeout(function () {
                        jq.unblockUI();
                        $modal.foundation('reveal', 'close');
                        me.ReInitialize();
                    }, 4000);
                }, me.CommonErrorHandler);
            });
        };

        MainContentViewController.prototype.Modal_SaveExistingEmbeddedContent = function ($modal) {
            var id = this.$getNamedFieldWithinModal($modal, "ID").val();
            var etag = this.$getNamedFieldWithinModal($modal, "ETag").val();
            var objectRelativeLocation = this.$getNamedFieldWithinModal($modal, "RelativeLocation").val();
            var iFrameTagContents = this.$getNamedFieldWithinModal($modal, "IFrameTagContents").val();
            var title = this.$getNamedFieldWithinModal($modal, "Title").val();
            var published = this.$getNamedFieldWithinModal($modal, "Published").val();
            var author = this.$getNamedFieldWithinModal($modal, "Author").val();
            var description = this.$getNamedFieldWithinModal($modal, "Description").val();
            var categories = this.$getNamedFieldWithinModal($modal, "Categories").val();

            var saveData = {
                Title: title,
                IFrameTagContents: iFrameTagContents,
                Description: description,
                Published: published,
                Author: author,
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

        MainContentViewController.prototype.OpenModalAddNewContentModal = function () {
            var $modal = this.$getNamedFieldWithin("AddNewContentModal");
            var me = this;

            //clearing the fields of the New Content Modal Form
            this.$getNamedFieldWithinModal($modal, "Content").val();
            this.$getNamedFieldWithinModal($modal, "Title").val();
            this.$getNamedFieldWithinModal($modal, "Excerpt").val();
            this.$getNamedFieldWithinModal($modal, "Author").val();
            this.$getNamedFieldWithinModal($modal, "Content").val();
            this.$getNamedFieldWithinModal($modal, "textareaDivHolder").empty();
            var textarea = $("<textarea name='Content' style='height: 300px;'>");
            this.$getNamedFieldWithinModal($modal, "textareaDivHolder").append(textarea);

            var categoryoptions = "<option value=''>(None)</option>";
            for (var i in this.currData.Categories.CollectionContent) {
                var categoryObject = me.currData.Categories.CollectionContent[i];
                var categoryID = categoryObject.ID;
                var categoryTitle = categoryObject.Title ? categoryObject.Title : "";
                categoryoptions += "<option value='" + categoryID + "'>" + categoryTitle + "</option>";
            }
            var $categoriesSelect = this.$getNamedFieldWithinModal($modal, "Categories");
            $categoriesSelect.empty();
            $categoriesSelect.append(categoryoptions);

            var contentJQ = this.$getNamedFieldWithinModal($modal, "Content");
            contentJQ.redactor({
                minHeight: 300,
                maxHeight: 350,
                autoresize: false,
                buttons: ['bold', 'italic', 'alignment', 'unorderedlist', 'orderedlist', 'image', 'video', "link"]
            });

            //clearing the fileInput
            var $newupdatefileinput = this.$getNamedFieldWithinModal($modal, "ImageData");
            $newupdatefileinput.replaceWith($newupdatefileinput = $newupdatefileinput.clone(true));

            //here the "cleaning" or reseting of the input fields ends.
            this.$getNamedFieldWithinModal($modal, "AttachmentAlertHolder").empty();
            var wnd = window;
            wnd.global_uploaded_attachments = 0;

            //wnd.getAndPopulateCategoryOptions();
            $("#addNewContentModal-ImageData").attr("data-oipfile-filegroupid", "addModal");
            var currentPublished = wnd.ParseRawTimestampToISOString(null);
            this.$getNamedFieldWithinModal($modal, "Published").val(currentPublished);

            var $imageDataInput = this.$getNamedFieldWithinModal($modal, "ImageData");
            $imageDataInput.attr("data-oipfile-filegroupid", "imageDataImage");
            this.currOPM.InitiateBinaryFileElementsAroundInput($imageDataInput, "000", "ImageData", null, "../assets/controlpanel/images/lightGray.jpg");

            var $attachmentBinaryDataInput = this.$getNamedFieldWithinModal($modal, "AttachmentBinaryData");
            $attachmentBinaryDataInput.attr("data-oipfile-filegroupid", "attachmentBinaryData");
            this.currOPM.InitiateBinaryFileElementsAroundInput($attachmentBinaryDataInput, "000", "AttachmentBinaryData", null, "../assets/controlpanel/images/lightGray.jpg");

            //***************ends the inputfile elment for the attachments on the "add new content" modal
            $modal.foundation('reveal', 'open');
        };

        MainContentViewController.prototype.EditContent = function ($source) {
            var $modal = this.$getNamedFieldWithin("EditContentModal");
            var me = this;
            var jq = $;
            var wnd = window;
            var clickedEditID = $source.attr("data-objectid");
            $.getJSON('../../AaltoGlobalImpact.OIP/TextContent/' + clickedEditID + ".json", function (contentData) {
                //tDCM.SetObjectInStorage(contentData);
                var queryValue = "";
                var currentObject = contentData;
                var currentID = currentObject.ID;
                var currentETag = currentObject.MasterETag;
                var currentRelativeLocation = currentObject.RelativeLocation;
                var currentTitle = currentObject.Title;
                var currentExcerpt = currentObject.Excerpt;
                var currentAuthor = currentObject.Author;
                var currentPublishedDate = wnd.ParseRawTimestampToISOString(currentObject.Published);

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
                var currentImagePath = currentObject.ImageData ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt : null;

                // Initiate binary file elements for image
                var noImageUrl = "../assets/controlpanel/images/lightGray.jpg";
                var $imageDataFileInput = me.$getNamedFieldWithinModal($modal, "ImageDataFileInput");
                $imageDataFileInput.attr("data-oipfile-filegroupid", "editModal");
                me.currOPM.InitiateBinaryFileElementsAroundInput($imageDataFileInput, currentID, "ImageData", currentImagePath, noImageUrl);

                if (currentObject.RawHtmlContent) {
                    currentObject.BodyRendered = currentObject.RawHtmlContent;
                } else if (currentObject.Body) {
                    var markdown = new wnd.MarkdownDeep.Markdown();
                    markdown.SafeMode = true;
                    currentObject.BodyRendered = markdown.Transform(currentObject.Body);
                } else
                    currentObject.BodyRendered = "";

                var currentArticleBody = currentObject.BodyRendered;

                // Kalle's contemplate fix to Hugo's raw management =>
                // the raw html is at BodyRendered as is, the current markdown rendering is as well now
                // previous problem: if there was markdown-entered data in the article it wasn't working in rawhtml
                var rawbody = currentArticleBody;

                me.$getNamedFieldWithinModal($modal, "ID").val(currentID);
                me.$getNamedFieldWithinModal($modal, "ETag").val(currentETag);
                me.$getNamedFieldWithinModal($modal, "RelativeLocation").val(currentRelativeLocation);
                me.$getNamedFieldWithinModal($modal, "Title").val(currentTitle);
                me.$getNamedFieldWithinModal($modal, "Published").val(currentPublishedDate);
                me.$getNamedFieldWithinModal($modal, "Excerpt").val(currentExcerpt);

                /*getAndPopulate_Isotope_Filter_Categories ();*/
                //getAndPopulateCategoryOptions();
                //check if the "field" Author exists in the JSON file
                /*queryValue=contentData.content[i].Author;*/
                if (currentAuthor == false || currentAuthor === null || currentAuthor === "undefined" || currentAuthor === undefined)
                    queryValue = "";
                else
                    queryValue = currentAuthor;

                me.$getNamedFieldWithinModal($modal, "Author").val(queryValue);

                //suggested Content rendering by Kalle:  queryValue=currentArticleBody;
                //My suggestion: cleaning the "old" articles with markdown and extra styling
                rawbody = rawbody.replace(new RegExp("div", "g"), 'p');
                rawbody = rawbody.replace(new RegExp("<span>", "g"), '');
                rawbody = rawbody.replace(new RegExp("</span>", "g"), '');
                var currentArticleBodyVHugo = jq.htmlClean(rawbody, { format: true });

                //ends cleaning the "old" articles with markdown and extra styling
                var textarea = $("<textarea name='Content' style='min-height: 300px;'>");
                var $TextAreaDivHolder = me.$getNamedFieldWithinModal($modal, "TextAreaDivHolder");
                $TextAreaDivHolder.empty();
                $TextAreaDivHolder.append(textarea);
                var $content = me.$getNamedFieldWithinModal($modal, "Content");
                $content.val(currentArticleBodyVHugo);
                $content.redactor({
                    minHeight: 300,
                    maxHeight: 350,
                    autoresize: false,
                    buttons: ['bold', 'italic', 'alignment', 'unorderedlist', 'orderedlist', 'image', 'video', "link"]
                });

                //queryValue = currentImagePath;
                //$('#editContentModal-imagePath').val(queryValue);
                //send the correspondent image to the placeholder, but clean its containing div first
                //$("#editContentModal-image").empty(); //clean the image Placeholder in the form
                //queryValue = "<img src='" + currentImagePath + "' style='width:auto;height:auto;max-height:300px;margin-left:auto;margin-right:auto;'>";
                //$("#editContentModal-image").append(queryValue);
                me.RefreshAttachments($modal, "AaltoGlobalImpact.OIP", "TextContent", currentID);
                $modal.foundation('reveal', 'open');
            }); //ends getJson
        };

        MainContentViewController.prototype.Modal_EditContentUploadAttachment = function ($modal) {
            var $fileInput = this.$getNamedFieldWithinModal($modal, "AttachmentBinaryData");
            var currContentID = this.$getNamedFieldWithinModal($modal, "ID").val();
            var me = this;

            var input = $fileInput[0];
            if (input.files && input.files[0]) {
                var firstFile = input.files[0];
                var fileName = firstFile.name;
                var reader = new FileReader();
                reader.onload = function (e) {
                    var fileContent = e.target.result;
                    var originalFilename = fileName;
                    var binaryFileSaveData = {
                        "FileEmbedded_Data": fileContent,
                        "Title": originalFilename,
                        "OriginalFileName": originalFilename
                    };
                    me.SaveAsBinaryAttachment("AaltoGlobalImpact.OIP", "TextContent", currContentID, binaryFileSaveData, $modal);
                };
                reader.readAsDataURL(input.files[0]);
            }
        };

        MainContentViewController.prototype.RefreshAttachments = function ($modal, objectDomain, objectName, objectID) {
            var me = this;
            var $attachmentFile = me.$getNamedFieldWithinModal($modal, "AttachmentBinaryData");
            me.currOPM.reset_field($attachmentFile);
            var $attachmentListDiv = me.$getNamedFieldWithinModal($modal, "AttachmentListDiv");
            $attachmentListDiv.empty();
            var wnd = window;
            $.getJSON("../../AaltoGlobalImpact.OIP/AttachedToObjectCollection/MasterCollection.json", function (attachments) {
                for (var i = 0; i < attachments.CollectionContent.length; i++) {
                    var currAttachment = attachments.CollectionContent[i];
                    if (currAttachment.TargetObjectDomain != objectDomain || currAttachment.TargetObjectName != objectName || currAttachment.TargetObjectID != objectID)
                        continue;
                    var binaryFile = me.getObjectByID(me.currData.BinaryFiles.CollectionContent, currAttachment.SourceObjectID);
                    if (binaryFile) {
                        var $deleteButton = $("<a class='oip-modalbutton' data-oip-command='RemoveAndDeleteAttachment' " + "data-attachmentid='" + currAttachment.ID + "' " + "data-sourceid='" + currAttachment.SourceObjectID + "' " + "data-objectid='" + objectID + "' " + "data-objectname='" + objectName + "' " + "data-objectdomain='" + objectDomain + "' " + "><i class='icon-remove-sign'></i></a>");
                        $deleteButton.on("click", wnd.ControllerCommon.ModalButtonClick);
                        $attachmentListDiv.append("<div>" + binaryFile.OriginalFileName + "</div>");
                        $attachmentListDiv.append($deleteButton);
                        $attachmentListDiv.append("<br>");
                    } else {
                        /*
                        $attachmentListDiv.append("<div>" + currAttachment.SourceObjectDomain + "/"
                        + currAttachment.SourceObjectName + "/"
                        + currAttachment.SourceObjectID + "</div>");
                        */
                        $attachmentListDiv.append("<div style='font-weight: bolder;color: Red'>Save content to refresh attachment details</div>");
                    }
                }
            });
        };

        MainContentViewController.prototype.Modal_RemoveAndDeleteAttachment = function ($modal, $source) {
            var attachmentID = $source.attr("data-attachmentid");
            var sourceID = $source.attr("data-sourceid");
            var objectID = $source.attr("data-objectid");
            var objectName = $source.attr("data-objectname");
            var objectDomain = $source.attr("data-objectdomain");
            var me = this;
            var jq = $;
            jq.blockUI({ message: '<h2>Detaching attachment...</h2>' });
            me.currOPM.DeleteIndependentObject("AaltoGlobalImpact.OIP", "AttachedToObject", attachmentID, function () {
                jq.blockUI({ message: '<h2>Removing attached content...</h2>' });
                me.currOPM.DeleteIndependentObject("AaltoGlobalImpact.OIP", "BinaryFile", sourceID, function () {
                    setTimeout(function () {
                        jq.unblockUI();
                        me.RefreshAttachments($modal, objectDomain, objectName, objectID);
                    }, 4000);
                }, me.CommonErrorHandler);
            }, me.CommonErrorHandler);
        };

        MainContentViewController.prototype.SaveAsBinaryAttachment = function (objectDomain, objectName, objectID, attachmentBinarySaveData, $modalToRefreshAttachmentsAfter) {
            var me = this;
            var jq = $;
            jq.blockUI({ message: '<h2>Uploading Attachment File...</h2>' });
            me.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "BinaryFile", attachmentBinarySaveData, function (dataResponse) {
                //jq.unblockUI();
                var binaryID = dataResponse.ID;
                jq.blockUI({ message: '<h2>Attaching file to this content...</h2>' });
                var attachedToData = {
                    SourceObjectID: binaryID,
                    SourceObjectName: "BinaryFile",
                    SourceObjectDomain: "AaltoGlobalImpact.OIP",
                    TargetObjectID: objectID,
                    TargetObjectName: objectName,
                    TargetObjectDomain: objectDomain
                };
                me.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "AttachedToObject", attachedToData, function (attachedDataResponse) {
                    if ($modalToRefreshAttachmentsAfter) {
                        setTimeout(function () {
                            jq.unblockUI();
                            me.RefreshAttachments($modalToRefreshAttachmentsAfter, objectDomain, objectName, objectID);
                        }, 4000);
                    } else
                        jq.unblockUI();
                }, me.CommonErrorHandler);
            }, me.CommonErrorHandler);
        };

        MainContentViewController.prototype.ViewContent = function ($source) {
            var me = this;
            var id = $source.attr("data-oip-command-args");
            var $modal = this.$getNamedFieldWithin("ViewContentModal");
            $.getJSON('../../AaltoGlobalImpact.OIP/TextContent/' + id + ".json", function (textContent) {
                var wnd = window;
                var currentObject = textContent;
                var currentID = textContent.ID;
                var currentTitle = currentObject.Title;
                var currentExcerpt = currentObject.Excerpt;
                var currentAuthor = currentObject.Author;
                var imageSizeString = "256";
                var currentMainCategory;
                var currentPublishedDate = wnd.ParseRawTimestampToDateString(currentObject.Published);
                var rawbody = currentObject.Body;
                var currentImagePath = currentObject.ImageData ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt : null;

                currentAuthor = currentObject.Author;
                if (!currentAuthor)
                    currentAuthor = "";

                var md = wnd.MarkdownDeep;
                if (currentObject.RawHtmlContent) {
                    currentObject.BodyRendered = currentObject.RawHtmlContent;
                } else if (currentObject.Body) {
                    var markdown = new md.Markdown();
                    markdown.SafeMode = true;
                    currentObject.BodyRendered = markdown.Transform(currentObject.Body);
                } else
                    currentObject.BodyRendered = "";
                var currentArticleBody = currentObject.BodyRendered;
                rawbody = currentArticleBody;

                //cleaning the "old" articles with markdown and extra styling
                rawbody = rawbody.replace(new RegExp("div", "g"), 'p');
                rawbody = rawbody.replace(new RegExp("<span>", "g"), '');
                rawbody = rawbody.replace(new RegExp("</span>", "g"), '');

                var jq = $;

                var currentArticleBodyVHugo = jq.htmlClean(rawbody, { format: true });

                //ends cleaning the "old" articles with markdown and extra styling
                var $modalTitle = me.$getNamedFieldWithinModal($modal, "Title");
                $modalTitle.empty().append(currentTitle);

                $("#viewContentModal-Author").empty();
                $('#viewContentModal-Author').append(currentAuthor);

                $("#viewContentModal-Date").empty();
                $('#viewContentModal-Date').append(currentPublishedDate);

                var queryValue = "<p>" + currentExcerpt + "</p>";
                $("#viewContentModal-excerpt").empty();
                $('#viewContentModal-excerpt').append(queryValue);

                if (!currentObject.Categories || !currentObject.Categories.CollectionContent)
                    currentMainCategory = "NEWS";
                else
                    currentMainCategory = currentObject.Categories.CollectionContent[0].Title;
                $("#viewContentModal-categories").empty();
                $('#viewContentModal-categories').append(currentMainCategory);

                $("#viewContentModal-content").empty();
                $('#viewContentModal-content').append(currentArticleBodyVHugo);

                //send the correspondent image to the placeholder, but clean its containing div first
                $("#viewContentModal-image").empty(); //clean the image Placeholder in the form
                queryValue = "<img src='" + currentImagePath + "' style='width:auto;height:auto;max-height:450px;margin-left:auto;margin-right:auto;'>";
                $("#viewContentModal-image").append(queryValue);
                $('#viewContentModal-image img').each(function () {
                    $(this).error(function () {
                        $(this).attr({
                            src: '../assets/controlpanel/images/white.png',
                            /*class:"hide",*/
                            alt: 'No image'
                        });
                    });
                    this.src = this.src;
                });

                $("#viewContentModal-attachments").empty();
                var myAttachments = wnd.getObjectAttachments(currentID);
                if (myAttachments.length > 0) {
                    var myBinaries = [];
                    for (var attachmentIX = 0; attachmentIX < myAttachments.length; attachmentIX++) {
                        var currAttachment = myAttachments[attachmentIX];
                        var binaryFileID = currAttachment.SourceObjectID;
                        var attachedBinary = wnd.getBinaryFile(binaryFileID);
                        if (attachedBinary && attachedBinary.Data)
                            myBinaries.push(attachedBinary);
                    }
                    myBinaries.sort(function (a, b) {
                        if (a && b && a.OriginalFileName && b.OriginalFileName)
                            return a.OriginalFileName.localeCompare(b.OriginalFileName);
                        return 0;
                    });
                    for (var binaryIX = 0; binaryIX < myBinaries.length; binaryIX++) {
                        var currBinary = myBinaries[binaryIX];
                        var data = currBinary.Data;
                        var contentID = data.ID;
                        var originalFileName = currBinary.OriginalFileName;
                        var binaryUrl = encodeURI("../../AaltoGlobalImpact.OIP/MediaContent/" + contentID + "/" + originalFileName);
                        var binaryLinkTag = '<br><a href="' + binaryUrl + '">' + originalFileName + '</a><br>';
                        $("#viewContentModal-attachments").append(binaryLinkTag);
                    }
                }

                wnd.ReConnectComments(currentID);

                $modal.foundation('reveal', 'open');
            });
        };

        MainContentViewController.prototype.PublishToWww = function () {
            var wnd = window;
            wnd.Foundation.libs.dropdown.close($("#drop-PostAndPublish"));
            this.CommonWaitForOperation("Publishing content... please wait");
            this.currOPM.ExecuteOperationWithForm("PublishGroupToWww", {}, this.CommonSuccessHandler, this.CommonErrorHandler);
        };

        MainContentViewController.prototype.DeleteContent = function ($this) {
            var id = $this.attr("data-objectid");
            var domainName = "AaltoGlobalImpact.OIP";
            var objectName = "TextContent";
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

        MainContentViewController.prototype.DeleteLinkToContent = function ($this) {
            var id = $this.attr("data-objectid");
            var domainName = "AaltoGlobalImpact.OIP";
            var objectName = "LinkToContent";
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

        MainContentViewController.prototype.DeleteEmbeddedContent = function ($this) {
            var id = $this.attr("data-objectid");
            var domainName = "AaltoGlobalImpact.OIP";
            var objectName = "EmbeddedContent";
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

        MainContentViewController.prototype.Modal_SaveExistingContent = function ($modal) {
            var id = this.$getNamedFieldWithinModal($modal, "ID").val();
            var etag = this.$getNamedFieldWithinModal($modal, "ETag").val();
            var objectRelativeLocation = this.$getNamedFieldWithinModal($modal, "RelativeLocation").val();
            var title = this.$getNamedFieldWithinModal($modal, "Title").val();
            var published = this.$getNamedFieldWithinModal($modal, "Published").val();
            var excerpt = this.$getNamedFieldWithinModal($modal, "Excerpt").val();
            var categories = this.$getNamedFieldWithinModal($modal, "Categories").val();
            var author = this.$getNamedFieldWithinModal($modal, "Author").val();
            var content = this.$getNamedFieldWithinModal($modal, "Content").val();
            content = $('<div/>').text(content).html();

            var saveData = {
                Title: title,
                Published: published,
                Excerpt: excerpt,
                "ENC.RawHtmlContent": content,
                Object_Categories: categories,
                Author: author
            };

            var me = this;
            var jq = $;
            this.currOPM.AppendBinaryFileValuesToData(id, saveData, function () {
                jq.blockUI({ message: '<h2>Saving content...</h2>' });
                me.currOPM.SaveIndependentObject(id, objectRelativeLocation, etag, saveData, function () {
                    setTimeout(function () {
                        jq.unblockUI();
                        $modal.foundation('reveal', 'close');
                        me.ReInitialize();
                    }, 2500);
                }, me.CommonErrorHandler);
            });
        };

        MainContentViewController.prototype.Modal_SaveNewContent = function ($modal) {
            var title = this.$getNamedFieldWithinModal($modal, "Title").val();
            var published = this.$getNamedFieldWithinModal($modal, "Published").val();
            var excerpt = this.$getNamedFieldWithinModal($modal, "Excerpt").val();
            var categories = this.$getNamedFieldWithinModal($modal, "Categories").val();
            var author = this.$getNamedFieldWithinModal($modal, "Author").val();
            var content = this.$getNamedFieldWithinModal($modal, "Content").val();
            content = $('<div/>').text(content).html();

            var saveData = {
                Title: title,
                Published: published,
                Excerpt: excerpt,
                "ENC.RawHtmlContent": content,
                Object_Categories: categories,
                Author: author
            };

            var me = this;
            var jq = $;
            this.currOPM.AppendBinaryFileValuesToData("000", saveData, function () {
                jq.blockUI({ message: '<h2>Adding new content...</h2>' });
                me.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "TextContent", saveData, function () {
                    setTimeout(function () {
                        jq.unblockUI();
                        $modal.foundation('reveal', 'close');
                        me.ReInitialize();
                    }, 2500);
                }, me.CommonErrorHandler);
            });
        };
        return MainContentViewController;
    })(ViewControllerBase);

    
    return MainContentViewController;
});
