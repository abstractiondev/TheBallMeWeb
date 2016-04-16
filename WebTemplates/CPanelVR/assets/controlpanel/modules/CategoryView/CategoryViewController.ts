/**
 * Created by kalle on 31.5.2014.
 */

/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />

import ViewControllerBase = require("../ViewControllerBase");

class CategoryViewController extends ViewControllerBase {

    currentData;
    currentContentRanks;
    currentSemantics;

    ControllerInitialize():void {
        var me = this;
        require(["CategoryView/CategoryEditor_dust",
            "CategoryView/CategoryView_Modals_dust",
            "CategoryView/category_treeitem_dust",
            "CategoryView/category_rowitem_dust",
            "CategoryView/category_rankitem_dust",
            "lib/dusts/objectdeleteicon_dust",
            "lib/dusts/command_button_dust",
            "lib/dusts/command_icon_dust",
            "lib/dusts/insidemodal_button_dust",
            "lib/dusts/hiddeninput_dust",
            "lib/dusts/modal_begin_dust",
            "lib/dusts/modal_end_dust",
            "lib/dusts/openmodal_button_dust"], () => {
            me.currUDG.GetData(me.dataUrl, (data) => {
                me.currentData = data;
                me.currentContentRanks = data.ManualRankingMap;
                me.currentSemantics = data.SemanticContentMap;
                dust.render("CategoryEditor.dust", data, (error, output) => {
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

    EditContentRanking($source) {
        var me = this;
        var id = $source.data("objectid");
        var $modal:any = this.$getNamedFieldWithin("CategoryContentRankingModal");
        me.$getNamedFieldWithinModal($modal, "CategoryID").val(id);
        //alert(JSON.stringify(this.currentContentRanks[id]));
        //alert(JSON.stringify(this.currentContentRanks));
        /*
        var currRanks = me.currentContentRanks[id];
        if(!currRanks)
            currRanks = [];
            */

        var currChildren = me.currentSemantics[id];
        //var currUnranked = _.where(currChildren, item => _.every(currRanks, function(rItem:any) { return rItem.ContentID != item.ID }));
        //var allContent = { "RankItems":  _.union(currRanks, currUnranked) };
        var allContent = { "RankItems":  currChildren };
        var $parentPh:any = me.$getNamedFieldWithinModal($modal, "nestableList");
        dust.render("category_rankitem.dust", allContent, (error, output) => {
            $parentPh.empty();
            $parentPh.html(output);
            $parentPh.nestable({
                maxDepth: 0
            });
            $modal.foundation("reveal", "open");
        });
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
        var me = this;
        $.getJSON("../../AaltoGlobalImpact.OIP/Category/" + id + ".json", function(currentObject) {
            var currentID = currentObject.ID;
            var currentETag = currentObject.MasterETag;
            var currentRelativeLocation = currentObject.RelativeLocation;

            var $imageDataInput = me.$getNamedFieldWithinModal($modal, "tmpCategoryImageData");
            var imageSizeString = "256";
            var currentImagePath = currentObject && currentObject.ImageData
                ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
                : null;
            me.currOPM.InitiateBinaryFileElementsAroundInput($imageDataInput, id, "ImageData", currentImagePath, null, "categoryImageData");
            me.$getNamedFieldWithinModal($modal, "title").val(currentObject.Title);
            me.$getNamedFieldWithinModal($modal, "excerpt").val(currentObject.Excerpt);
            me.$getNamedFieldWithinModal($modal, "ID").val(currentID);
            me.$getNamedFieldWithinModal($modal, "ETag").val(currentETag);
            me.$getNamedFieldWithinModal($modal, "RelativeLocation").val(currentRelativeLocation);
            $modal.foundation("reveal", "open");
        });
    }

    DeleteObject($source) {
        var id = $source.data("objectid");
        var domainName = $source.data("domainname");
        var objectName = $source.data("objectname");

        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Deleting...</h2>' });
        this.currOPM.DeleteIndependentObject(domainName, objectName, id, function(responseData) {
            jq.unblockUI();
            me.ReInitialize();
        });
        /*
         data-objectid="{ID}" data-objectname="{Name}" data-domainname="{SemanticDomainName}"

         */
    }

    Modal_SaveCategoryRanking($modal) {
        var $nestableList:any = this.$getNamedFieldWithinModal($modal, "nestableList");
        //var list:any = $nestableList.length ? $nestableList : $($nestableList);
        var list:any = $nestableList;
        var itemArray = [];
        var rankValue = 100000;
        $nestableList.find("li").each(function(index) {
            var liItem = $(this);
            var itemID = liItem.data("id");
            var semanticDomain = liItem.data("semanticdomain");
            var semanticType = liItem.data("semantictype");

            var contentItem = {
                "ContentID": itemID,
                "ContentSemanticType": semanticDomain + "." + semanticType,
                "RankName": "MANUAL",
                "RankValue": rankValue.toString()
            };
            itemArray.push(contentItem);
            rankValue += 10;
        });
        var categoryID = this.$getNamedFieldWithinModal($modal, "CategoryID").val();
        var categoryRankingData = {
            "CategoryID": categoryID,
            "RankingItems": itemArray
        };
        var jsonData = JSON.stringify(categoryRankingData);
        //var jsonData = JSON.stringify(list.nestable("serialize"));
        console.log(jsonData);
        var me = this;
        var jq:any = $;
        jq.blockUI({ message: "<h2>Saving...</h2>"});
        var userSuccess = function() {
            jq.unblockUI();
            $modal.foundation('reveal', 'close');
            me.ReInitialize();
        };
        var userFailure = function(){
            jq.unblockUI();
            alert("Error Occurred at Save");
            //window.location.reload(true);
        };
        $.ajax({
            type: "POST",
            url: "?operation=AaltoGlobalImpact.OIP.SetCategoryContentRanking",
            //dataType: "json", - this would require returning parseable json (on TODO list)
            contentType: "application/json",
            data: jsonData,
        }).done(response => me.currOPM.AjaxPollingOperation(response, userSuccess)).fail(userFailure);;
    }

    Modal_SaveCategoryHierarchy($modal) {
        var $nestableTree = this.$getNamedFieldWithinModal($modal, "nestableTree");
        var list:any = $nestableTree.length ? $nestableTree : $($nestableTree);
        /*output = list.data('output');*/
        var jsonData;
        jsonData = JSON.stringify(list.nestable('serialize'));
        console.log(jsonData);
        var me = this;
        var jq:any = $;
        jq.blockUI({ message: '<h2>Saving...</h2>' });
        var userSuccess = function() {
            setTimeout(function() {
                jq.unblockUI();
                $modal.foundation('reveal', 'close');
                me.ReInitialize();
            }, 2500);
        };
        var userFailure =function() {
            jq.unblockUI();
            alert("Error Occurred at Save");
            //window.location.reload(true);
        };
        $.ajax(
            { type: "POST",
                url: "?operation=AaltoGlobalImpact.OIP.SetCategoryHierarchyAndOrderInNodeSummary",
                //dataType: "json", - this would require returning parseable json (on TODO list)
                contentType: "application/json",
                data: jsonData,
            }
        ).done(response => me.currOPM.AjaxPollingOperation(response, userSuccess)).fail(userFailure);
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
                jq.unblockUI();
                me.ReInitialize();
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
            jq.unblockUI();
            $modal.foundation('reveal', 'close');
            me.ReInitialize();
        }, function() {
            jq.unblockUI();
            alert("Save failed!");
        });
    }

    Modal_SaveExisting($modal, $source) {
        var id = this.$getNamedFieldWithinModal($modal, "ID").val();
        var objectRelativeLocation = this.$getNamedFieldWithinModal($modal, "RelativeLocation").val();
        var eTag = this.$getNamedFieldWithinModal($modal, "ETag").val();
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
                jq.unblockUI();
                $modal.foundation('reveal', 'close');
                me.ReInitialize();
            }, function() {
                alert("Save failed!");
                jq.unblockUI();
            });
        });

    }

}

export = CategoryViewController;
