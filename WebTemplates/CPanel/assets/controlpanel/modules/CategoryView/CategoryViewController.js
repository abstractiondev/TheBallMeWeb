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
    var CategoryViewController = (function (_super) {
        __extends(CategoryViewController, _super);
        function CategoryViewController() {
            _super.apply(this, arguments);
        }
        CategoryViewController.prototype.ControllerInitialize = function () {
            var me = this;
            require([
                "CategoryView/CategoryEditor_dust",
                "CategoryView/CategoryView_Modals_dust",
                "CategoryView/category_treeitem_dust",
                "CategoryView/category_rowitem_dust",
                "lib/dusts/objectdeleteicon_dust",
                "lib/dusts/command_button_dust",
                "lib/dusts/command_icon_dust",
                "lib/dusts/insidemodal_button_dust",
                "lib/dusts/hiddeninput_dust",
                "lib/dusts/modal_begin_dust",
                "lib/dusts/modal_end_dust",
                "lib/dusts/openmodal_button_dust"], function () {
                me.currUDG.GetData(me.dataUrl, function (callBackData) {
                    me.currentData = callBackData;
                    dust.render("CategoryEditor.dust", callBackData, function (error, output) {
                        if (error)
                            alert("Dust error: " + error);
                        var $hostDiv = $("#" + me.divID);
                        $hostDiv.empty();
                        $hostDiv.html(output);
                        $(window).trigger("resize");
                        me.ControllerInitializeDone();
                    });
                });
            });
        };

        CategoryViewController.prototype.VisibleTemplateRender = function () {
            var _this = this;
            $.when(this.DoneInitializedPromise()).then(function () {
                var nestable = _this.$getNamedFieldWithin("nestableTree");
                nestable.nestable({});
            });
        };

        CategoryViewController.prototype.InvisibleTemplateRender = function () {
            // alert("categories invisible renderer" + this.divID);
        };

        CategoryViewController.prototype.OpenModalCategoryHierarchyModal = function () {
            var $modal = this.$getNamedFieldWithin("CategoryHierarchyModal");
            $modal.foundation('reveal', 'open');
        };

        CategoryViewController.prototype.OpenModalAddCategoryModal = function () {
            var $modal = this.$getNamedFieldWithin("AddCategoryModal");
            $modal.foundation('reveal', 'open');
        };

        CategoryViewController.prototype.getCategoryByID = function (id) {
            var categoryCollection = this.currentData.CategoriesWithChildren;
            for (var i = 0; i < categoryCollection.length; i++) {
                var currObj = categoryCollection[i];
                if (currObj.ID === id)
                    return currObj;
            }
            return null;
        };

        CategoryViewController.prototype.EditCategory = function ($source) {
            var id = $source.data("objectid");
            var $modal = this.$getNamedFieldWithin("EditCategoryModal");
            var $imageDataInput = this.$getNamedFieldWithinModal($modal, "tmpCategoryImageData");
            var me = this;
            var currentObject = me.getCategoryByID(id);
            if (!currentObject) {
                alert("Current category with ID not found: " + id);
                return;
            }

            if ($imageDataInput.length == 1) {
                var imageSizeString = "256";
                var currentImagePath = currentObject && currentObject.ImageData ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt : null;
                this.currOPM.InitiateBinaryFileElementsAroundInput($imageDataInput, id, "ImageData", currentImagePath, null);
            }
            this.$getNamedFieldWithinModal($modal, "title").val(currentObject.Title);
            this.$getNamedFieldWithinModal($modal, "excerpt").val(currentObject.Excerpt);
            this.$getNamedFieldWithinModal($modal, "ID").val(currentObject.ID);

            $modal.foundation("reveal", "open");
        };

        CategoryViewController.prototype.DeleteObject = function ($source) {
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
            /*
            data-objectid="{ID}" data-objectname="{Name}" data-domainname="{SemanticDomainName}"
            
            */
        };

        CategoryViewController.prototype.Modal_SaveCategoryHierarchy = function ($modal) {
            var $nestableTree = this.$getNamedFieldWithinModal($modal, "nestableTree");
            var list = $nestableTree.length ? $nestableTree : $($nestableTree);

            /*output = list.data('output');*/
            var jsonData;
            jsonData = JSON.stringify(list.nestable('serialize'));
            var me = this;
            var jq = $;
            jq.blockUI({ message: '<h2>Saving...</h2>' });
            $.ajax({
                type: "POST",
                url: "?operation=AaltoGlobalImpact.OIP.SetCategoryHierarchyAndOrderInNodeSummary",
                //dataType: "json", - this would require returning parseable json (on TODO list)
                contentType: "application/json",
                data: jsonData,
                success: function () {
                    setTimeout(function () {
                        jq.unblockUI();
                        $modal.foundation('reveal', 'close');
                        me.ReInitialize();
                    }, 2500);
                },
                error: function () {
                    jq.unblockUI();
                    alert("Error Occurred at Save");
                    //window.location.reload(true);
                }
            });
        };

        CategoryViewController.prototype.AddNewCategories = function () {
            var categoryList = this.$getNamedFieldWithin("addNewCategoriesTitles");
            var operationData = {
                "CategoryList": categoryList.val()
            };
            var me = this;
            var me = this;
            var jq = $;
            jq.blockUI({ message: '<h2>Saving...</h2>' });
            this.currOPM.ExecuteOperationWithForm("AddCategories", operationData, function () {
                setTimeout(function () {
                    jq.unblockUI();
                    me.ReInitialize();
                }, 2500);
            }, function () {
                jq.unblockUI();
                alert("Category add error!");
            });
        };

        CategoryViewController.prototype.Modal_SaveNew = function ($modal, $source) {
            var title = this.$getNamedFieldWithinModal($modal, "title").val();
            var excerpt = this.$getNamedFieldWithinModal($modal, "excerpt").val();
            var saveData = {
                "Title": title,
                "Excerpt": excerpt
            };
            var me = this;
            var jq = $;
            jq.blockUI({ message: '<h2>Saving...</h2>' });
            this.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "Category", saveData, function (obj) {
                setTimeout(function () {
                    jq.unblockUI();
                    $modal.foundation('reveal', 'close');
                    me.ReInitialize();
                }, 2500);
            }, function () {
                jq.unblockUI();
                alert("Save failed!");
            });
        };

        CategoryViewController.prototype.Modal_SaveExisting = function ($modal, $source) {
            var id = this.$getNamedFieldWithinModal($modal, "ID").val();
            var contentObject = this.getCategoryByID(id);
            if (!contentObject) {
                alert("Error in retrieving content object being edited!");
                $modal.foundation("reveal", "close");
                this.ReInitialize();
                return;
            }
            var objectRelativeLocation = contentObject.RelativeLocation;
            var eTag = contentObject.MasterETag;
            var title = this.$getNamedFieldWithinModal($modal, "title").val();
            var excerpt = this.$getNamedFieldWithinModal($modal, "excerpt").val();
            var saveData = {
                "Title": title,
                "Excerpt": excerpt
            };
            var jq = $;
            var me = this;
            this.currOPM.AppendBinaryFileValuesToData(id, saveData, function () {
                jq.blockUI({ message: '<h2>Saving...</h2>' });

                //alert(JSON.stringify(saveData));
                me.currOPM.SaveIndependentObject(id, objectRelativeLocation, eTag, saveData, function () {
                    setTimeout(function () {
                        jq.unblockUI();
                        $modal.foundation('reveal', 'close');
                        me.ReInitialize();
                    }, 2500);
                }, function () {
                    alert("Save failed!");
                    jq.unblockUI();
                });
            });
        };
        return CategoryViewController;
    })(ViewControllerBase);

    
    return CategoryViewController;
});
