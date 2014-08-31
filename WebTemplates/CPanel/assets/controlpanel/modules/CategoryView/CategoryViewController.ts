/**
 * Created by kalle on 31.5.2014.
 */

/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />

import ViewControllerBase = require("../ViewControllerBase");

class CategoryViewController extends ViewControllerBase {

    currentData;

    ControllerInitialize():void {
        var me = this;
        require(["CategoryView/CategoryEditor_dust",
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
            "lib/dusts/openmodal_button_dust"], () => {
            me.currUDG.GetData(me.dataUrl, (callBackData) => {
                me.currentData = callBackData;
                dust.render("CategoryEditor.dust", callBackData, (error, output) => {
                    if(error)
                        alert("Dust error: " + error);
                    var $hostDiv = $("#" + me.divID);
                    $hostDiv.empty();
                    $hostDiv.html(output);
                    $(window).trigger("resize");
                    me.ControllerInitializeDone();
                });
            });
        });
    }

    public VisibleTemplateRender():void {
        $.when(this.DoneInitializedPromise()).then(() => {
            var nestable:any = this.$getNamedFieldWithin("nestableTree");
            nestable.nestable({});
        });
    }

    public InvisibleTemplateRender():void {
        // alert("categories invisible renderer" + this.divID);
    }

    OpenModalCategoryHierarchyModal() {
        var $modal:any = this.$getNamedFieldWithin("CategoryHierarchyModal");
        $modal.foundation('reveal', 'open');
    }

    OpenModalAddCategoryModal() {
        var $modal:any = this.$getNamedFieldWithin("AddCategoryModal");
        $modal.foundation('reveal', 'open');
    }

    getCategoryByID(id:string) : any {
        var categoryCollection = this.currentData.CategoriesWithChildren;
        for(var i = 0; i < categoryCollection.length; i++) {
            var currObj = categoryCollection[i];
            if(currObj.ID === id)
                return currObj;
        }
        return null;
    }

    EditCategory($source) {
        var id = $source.data("objectid");
        var $modal:any = this.$getNamedFieldWithin("EditCategoryModal");
        var $imageDataInput = this.$getNamedFieldWithinModal($modal, "tmpCategoryImageData");
        var me = this;
        var currentObject = me.getCategoryByID(id);
        if(!currentObject) {
            alert("Current category with ID not found: " + id);
            return;
        }

        if($imageDataInput.length == 1) {
            var imageSizeString = "256";
            var currentImagePath = currentObject && currentObject.ImageData
                ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
                : null;
            this.currOPM.InitiateBinaryFileElementsAroundInput($imageDataInput, id, "ImageData", currentImagePath, null);
        }
        this.$getNamedFieldWithinModal($modal, "title").val(currentObject.Title);
        this.$getNamedFieldWithinModal($modal, "excerpt").val(currentObject.Excerpt);
        this.$getNamedFieldWithinModal($modal, "ID").val(currentObject.ID);

        $modal.foundation("reveal", "open");
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
        /*
         data-objectid="{ID}" data-objectname="{Name}" data-domainname="{SemanticDomainName}"

         */
    }

    Modal_SaveCategoryHierarchy($modal) {
        var $nestableTree = this.$getNamedFieldWithinModal($modal, "nestableTree");
        var list:any = $nestableTree.length ? $nestableTree : $($nestableTree);
        /*output = list.data('output');*/
        var jsonData;
        jsonData = JSON.stringify(list.nestable('serialize'));
        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Saving...</h2>' });
        $.ajax(
            { type: "POST",
                url: "?operation=AaltoGlobalImpact.OIP.SetCategoryHierarchyAndOrderInNodeSummary",
                //dataType: "json", - this would require returning parseable json (on TODO list)
                contentType: "application/json",
                data: jsonData,
                success: function() {
                    setTimeout(function() {
                        jq.unblockUI();
                        $modal.foundation('reveal', 'close');
                        me.ReInitialize();
                    }, 2500);
                },
                error: function(){
                    jq.unblockUI();
                    alert("Error Occurred at Save");
                    //window.location.reload(true);
                }
            }
        );
    }

    AddNewCategories() {
        var categoryList = this.$getNamedFieldWithin("addNewCategoriesTitles");
        var operationData = {
            "CategoryList": categoryList.val()
        };
        var me = this;
        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Saving...</h2>' });
        this.currOPM.ExecuteOperationWithForm("AddCategories", operationData,
            function() {
                setTimeout(function() {
                    jq.unblockUI();
                    me.ReInitialize();
                }, 2500);
            },
            function() {
                jq.unblockUI();
                alert("Category add error!");
            });
    }

    Modal_SaveNew($modal, $source) {
        var title = this.$getNamedFieldWithinModal($modal, "title").val();
        var excerpt = this.$getNamedFieldWithinModal($modal, "excerpt").val();
        var saveData = {
            "Title": title,
            "Excerpt": excerpt,
        }
        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Saving...</h2>' });
        this.currOPM.CreateObjectAjax("AaltoGlobalImpact.OIP", "Category", saveData, function(obj) {
            setTimeout(function() {
                jq.unblockUI();
                $modal.foundation('reveal', 'close');
                me.ReInitialize();
            }, 2500);
        }, function() {
            jq.unblockUI();
            alert("Save failed!");
        });
    }

    Modal_SaveExisting($modal, $source) {
        var id = this.$getNamedFieldWithinModal($modal, "ID").val();
        var contentObject = this.getCategoryByID(id);
        if(!contentObject) {
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
            "Excerpt": excerpt,
        }
        var jq:any = $;
        var me = this;
        this.currOPM.AppendBinaryFileValuesToData(id, saveData, function() {
            jq.blockUI({ message: '<h2>Saving...</h2>' });
            //alert(JSON.stringify(saveData));
            me.currOPM.SaveIndependentObject(id, objectRelativeLocation, eTag, saveData, function() {
                setTimeout(function() {
                    jq.unblockUI();
                    $modal.foundation('reveal', 'close');
                    me.ReInitialize();
                }, 2500);
            }, function() {
                alert("Save failed!");
                jq.unblockUI();
            });
        });

    }

}

export = CategoryViewController;
