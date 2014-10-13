/**
 * Created by Kalle on 10.10.2014.
 */
var tUI = TheBall.Interface.UI;
var tDCM = new tUI.DataConnectionManager();
var tOP = new tUI.OperationManager(tDCM);
var tUDG = new tUI.UpdatingDataGetter();

tUDG.RegisterDataURL("SEMANTICCONTENT", function(args) {
    var textContentCollection = args[0][0];
    var linkToContentCollection = args[1][0];
    var embeddedContentCollection = args[2][0];
    var categoryCollection = args[3][0];
    var sourceUnion = _.union(textContentCollection.CollectionContent,
        linkToContentCollection.CollectionContent,
        embeddedContentCollection.CollectionContent,
        categoryCollection.CollectionContent);
    var semanticCollection = _.map(sourceUnion, function(item) {
        var semanticObject = {
            "ContentID": item.ID,
            "SemanticDomain": item.SemanticDomainName,
            "SemanticType": item.Name,
            "Title": item.Title
            //"Object": item
        };
        if(semanticObject.SemanticDomain == "AaltoGlobalImpact.OIP" && semanticObject.SemanticType == "Category")
        {
            semanticObject.CategoryIDs = [];
            if(item.ParentCategoryID != null)
                semanticObject.CategoryIDs.push(item.ParentCategoryID);
        }
        else {
            if(item.Categories != null)
            {
                semanticObject.CategoryIDs =
                    _.map(item.Categories.CollectionContent, function(catItem) { return catItem.ID; })
            } else {
                semanticObject.CategoryIDs = [];
            }

        }
        return semanticObject;
    });
    return {
        SemanticCollection : semanticCollection,
        TextContents : textContentCollection,
        LinkTos : linkToContentCollection,
        Embeddeds : embeddedContentCollection,
        Categories : categoryCollection
    };
}, [ "../../AaltoGlobalImpact.OIP/TextContentCollection/MasterCollection.json",
    "../../AaltoGlobalImpact.OIP/LinkToContentCollection/MasterCollection.json",
    "../../AaltoGlobalImpact.OIP/EmbeddedContentCollection/MasterCollection.json",
    "../../AaltoGlobalImpact.OIP/CategoryCollection/MasterCollection.json",
]);

tUDG.RegisterDataURL("CATEGORYRANKS", function (args) {
    var contentCategoryRanks = args[0][0];
    console.log(JSON.stringify(contentCategoryRanks));
    var semanticObjects = args[1];
    var semanticContents = semanticObjects.SemanticCollection;
    var manualRanks = _.where(contentCategoryRanks.CollectionContent, { "RankName": "MANUAL" } );
    console.log("Unfiltered: " + contentCategoryRanks.CollectionContent);
    console.log(JSON.stringify(manualRanks));
    manualRanks = _.sortBy(manualRanks, function(item) {
        return item.RankValue;
    });
    var categoryManualRankMap = _.groupBy(manualRanks, function(item) {
        return item.CategoryID;
    });

    var semanticContentCategoryMap = {};
    _.forEach(semanticContents, function(semItem) {
        _.forEach(semItem.CategoryIDs, function(catID) {
            var currentMapArray = semanticContentCategoryMap[catID];
            if(!currentMapArray) {
                currentMapArray = [];
                semanticContentCategoryMap[catID] = currentMapArray;
            }
            var containsAlready = _.any(currentMapArray, function(item) {
                return item.ContentID == semItem.ContentID;
            });
            if(!containsAlready) {
                semItem.RankValue = "200000";
                currentMapArray.push(semItem);
            }
        });
    });

    // Sort semantic contents based on category rank map
    _.each(semanticContentCategoryMap, function(arrayData, key) {
        var rankData = categoryManualRankMap[key];
        if(rankData) {
            var sortedArray = _.sortBy(arrayData, function(item) {
                var rankIndex = _.findIndex(rankData, function(ixCandidate) {
                    return ixCandidate.ContentID == item.ContentID;
                });
                if(rankIndex == -1)
                    return item.RankValue;
                item.RankValue = rankData[rankIndex].RankValue;
                return rankIndex;
            });
            semanticContentCategoryMap[key] = sortedArray;
        }
    });

    return {
        ManualRankingMap : categoryManualRankMap,
        CategoryContentMap : semanticContentCategoryMap,
        SemanticContents : semanticContents,
        SemanticObjects: semanticObjects
    };
}, [
    "../../AaltoGlobalImpact.OIP/ContentCategoryRankCollection/MasterCollection.json",
    "SEMANTICCONTENT"
]);

var SemanticContentMap = null;
var CategoryContentMap = null;
var CurrentCategoryID = null;
var CategoriesMap = null;

$.holdReady(true);
tUDG.GetData("CATEGORYRANKS", function(data) {
    SemanticContentMap = {};
    _.each(data.SemanticContents, function(item) {
        SemanticContentMap[item.ContentID] = item;
    });
    CategoryContentMap = data.CategoryContentMap;
    CategoriesMap = {};
    _.each(data.SemanticObjects.Categories.CollectionContent, function(item) {
        CategoriesMap[item.ID] = item;
    });
    $.holdReady(false);
});

var GetArticleTypeFromID = function(id) {
    var semanticItem = SemanticContentMap[id];
    if(!semanticItem)
        return "";
    if(semanticItem.SemanticType == "TextContent")
        return "text";
};

var GetPrevData = function(semanticContentID, categoryID, isDifferentCategory) {
    var currentCategoryRanking = CategoryContentMap[categoryID];
    var currentIndex = _.findIndex(currentCategoryRanking, function(currItem) {
        return currItem.ContentID == semanticContentID;
    });
    var prevData;
    if(currentIndex > 0)
        prevData = currentCategoryRanking[currentIndex - 1];
    else {
        var currCategory = CategoriesMap[categoryID];
        var parentCategoryID = currCategory.ParentCategoryID;
        if(parentCategoryID)
            return GetPrevData(categoryID, parentCategoryID, true);
        return null;
    }
    return { IsDifferentCategory : isDifferentCategory, Data : prevData };
};

var GetNextData = function(semanticContentID, categoryID, isDifferentCategory) {
    var currentCategoryRanking = CategoryContentMap[categoryID];
    var currentIndex = _.findIndex(currentCategoryRanking, function(currItem) {
        return currItem.ContentID == semanticContentID;
    });
    var nextData;
    if(currentIndex < currentCategoryRanking.length - 1) {
        nextData = currentCategoryRanking[currentIndex + 1];
        /*
        while(nextData.SemanticType == "Category") {
            var nextCategory = CategoriesMap[nextData.ContentID];
            var nextCategoryRanking = CategoryContentMap[nextCategory.ID];
            if(nextCategoryRanking.length > 0)
                nextData = nextCategoryRanking[0];
            else
        }
        */
    }
    else {
        var currCategory = CategoriesMap[categoryID];
        var parentCategoryID = currCategory.ParentCategoryID;
        if(parentCategoryID)
            return GetNextData(categoryID, parentCategoryID, true);
        return null;
    }
    return { IsDifferentCategory : isDifferentCategory, Data : nextData };
};

$(function () {
    var openArticleType = $.url().param("type");
    var openArticleID = $.url().param("id");
    if(openArticleType && openArticleID) {
        window.history.pushState("string", "Aalto Global Impact", "index.html");
        openArticle(openArticleType, openArticleID);
    }

    var openCategoryID = $.url().param("cat");
    var openContentID = $.url().param("con");
    if(openCategoryID && openContentID) {
        var articleType = GetArticleTypeFromID(openContentID);
        //var articleType = "text";
        CurrentCategoryID = openCategoryID;
        openArticle(articleType, openContentID);
    }
});


var clearViewContentOnClose = function() {
    $("#viewContentModal-content").html("");
    $("#viewContentModal-iframes").html("");
};

String.prototype.replaceAll = function(strReplace, strWith) {
    var reg = new RegExp(strReplace, 'ig');
    return this.replace(reg, strWith);
};

var ReplaceWithMarkdownRender = function(containingObj, sourceField, targetField)
{
    var markdown = new MarkdownDeep.Markdown();
    markdown.SafeMode = true;
    if(containingObj == false)
        return;
    var sourceData = containingObj[sourceField];
    var renderedData;
    if(sourceData)
        renderedData = markdown.Transform(sourceData.replaceAll("javascript:", ""));
    else
        renderedData = "";
    containingObj[targetField] = renderedData;
};

OipOpenArticle = function(urlarg, addRelativePath) {
    var targeturl = $(this).data('contenturl');
    if (targeturl == null) {
        targeturl = urlarg;
        if(addRelativePath)
            targeturl = "../" + targeturl;
    }
    else
        targeturl = "../" + targeturl;
    if (targeturl == null) {
        return;
    }

    $.ajax({
        url: targeturl,
        cache: true,
        success: function (textContent) {
            var articleUrl = targeturl;
            var currentID = textContent.ID;

            var previousContentID;
            var nextContentID;
            $("#previousContent").hide();
            $("#nextContent").hide();
            var categoryID = CurrentCategoryID;
            var $catPanel = $("#categorypanel");
            $catPanel.empty();
            if(categoryID && CategoriesMap[categoryID]) {
                /*
                var rankingData = CategoryContentMap[categoryID];
                console.log(JSON.stringify(rankingData));
                var currIX = _.findIndex(rankingData, function(item) {
                    return item.ContentID == currentID;
                });
                if(currIX >= 0) {
                    if(currIX > 0)
                        previousContentID = rankingData[currIX - 1].ContentID;
                    if(currIX < rankingData.length - 1)
                        nextContentID = rankingData[currIX + 1].ContentID;
                    if(previousContentID) {
                        var previousContent = SemanticContentMap[previousContentID];
                        console.log("Prev: " + JSON.stringify(previousContent));
                        $("#previousContent").text(previousContent.Title);
                        $("#previousContent").data("cat", categoryID);
                        $("#previousContent").data("con", previousContentID);
                        $("#previousContent").show();
                    }
                    if(nextContentID) {
                        var nextContent = SemanticContentMap[nextContentID];
                        console.log("Next: " + JSON.stringify(nextContent));
                        $("#nextContent").text(nextContent.Title);
                        $("#nextContent").data("cat", categoryID);
                        $("#nextContent").data("con", nextContentID);
                        $("#nextContent").show();
                    }
                }*/
                var prevData = GetPrevData(currentID, categoryID);
                if(prevData) {
                    var previousContent = prevData.Data;
                    console.log("Prev: " + JSON.stringify(previousContent));
                    $("#previousContent").text(previousContent.Title);
                    $("#previousContent").data("cat", categoryID);
                    $("#previousContent").data("con", prevData.Data.ContentID);
                    $("#previousContent").show();
                }
                var nextData = GetNextData(currentID, categoryID);
                if(nextData) {
                    var nextContent = nextData.Data;
                    console.log("Next: " + JSON.stringify(nextContent));
                    $("#nextContent").text(nextContent.Title);
                    $("#nextContent").data("cat", categoryID);
                    $("#nextContent").data("con", nextData.Data.ContentID);
                    $("#nextContent").show();
                }
                var currActiveCategory = CategoriesMap[categoryID];
                if(currActiveCategory.ImageData) {
                    var imageSizeString = 256;
                    var imageUrl = "../../AaltoGlobalImpact.OIP/MediaContent/" + currActiveCategory.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currActiveCategory.ImageData.AdditionalFormatFileExt
                    $catPanel.append("<img src=\"" + imageUrl + "\"><br>");
                }
                $catPanel.append("<div>" + currActiveCategory.Title + "</div>");
            }


            var iFrameList = [];
            if(textContent.IFrameSources) {
                var nonTaggedList = textContent.IFrameSources.split('\n');
                $.each(nonTaggedList, function(index, value) {
                    var taggedVersion = "<iframe " + value + "></iframe>";
                    iFrameList.push(taggedVersion);
                });
            }
            var contentData = { "CollectionContent": [ textContent ] };
            var queryValue="";
            markdown = new MarkdownDeep.Markdown();
            markdown.SafeMode = true;
            var i = 0;

            queryValue=contentData.CollectionContent[i].Title;
            $("#viewContentModal-title").empty();
            $('#viewContentModal-title').append(queryValue);

            queryValue="<p>"+contentData.CollectionContent[i].Excerpt+"</p>";
            $("#viewContentModal-excerpt").empty();
            $('#viewContentModal-excerpt').append(queryValue);

            //var currentMainCategory=contentData.CollectionContent[i].Categories.CollectionContent[0].Title;
            var currentMainCategory="News";

            //queryValue=contentData.CollectionContent[i].content_type;
            $("#viewContentModal-categories").empty();
            $('#viewContentModal-categories').append(currentMainCategory);

            var rawbody;
            rawbody = contentData.CollectionContent[i].RawHtmlContent;
            if(rawbody) {
                rawbody=rawbody.replace(new RegExp("div", "g"), 'p');
                rawbody=rawbody.replace(new RegExp("<span>", "g"), '');
                rawbody=rawbody.replace(new RegExp("</span>", "g"), '');

                queryValue=$.htmlClean(rawbody, {
                    removeTags: ["basefont", "center", "dir", "font", "frame", "frameset", "isindex", "menu", "noframes", "s", "strike", "u"],
                    format:true
                });
            } else {
                var bodyRendered = markdown.Transform(contentData.CollectionContent[i].Body.replaceAll("javascript:", ""));
                rawbody = bodyRendered;
                queryValue = rawbody;
            }

            $("#viewContentModal-content").empty();
            $('#viewContentModal-content').append(queryValue);

            var lastSlashIndex = articleUrl.lastIndexOf("/");
            var lastExtIndex = articleUrl.lastIndexOf(".json");
            var articleIDFromArticleUrl = articleUrl.substring(lastSlashIndex + 1, lastExtIndex);
            var currentURL = "http://www.onlinetaekwondo.com/html/index.html?type=text&id="+ articleIDFromArticleUrl;
            $("#articleShareURLinput").attr("placeholder",currentURL);
            $("#articleShareURLinput").val(currentURL);

            if ((contentData.CollectionContent[i].Author===null)||(!contentData.CollectionContent[i].Author) )
                var currentAuthor="Aalto Global Impact";
            else
                var currentAuthor=contentData.CollectionContent[i].Author;
            queryValue=contentData.CollectionContent[i].Author;
            $("#viewContentModal-Author").empty();
            $('#viewContentModal-Author').append(currentAuthor);

            var recordedJsonDate = contentData.CollectionContent[i].Published;
            var pattern = /[0-9]+/; //to find the number within the string, first occurrence.
            recordedJsonDate = (recordedJsonDate.match(pattern))/1000;
            var extractedDate= new Date(1000*recordedJsonDate);
            //extractedDate = extractedDate.toLocaleString();
            var cardDate = extractedDate.getDate()+".";
            cardDate+= (extractedDate.getMonth() + 1) +".";
            cardDate+= extractedDate.getFullYear();

            $("#viewContentModal-Date").empty();
            $('#viewContentModal-Date').append(cardDate );

            //send the correspondent image to the placeholder, but clean its containing div first
            if (contentData.CollectionContent[i].ImageData===null)
            {
                var currentImage= "images/preview.jpg";
            }

            else
            {
                var imgID = contentData.CollectionContent[i].ImageData.ID;
                var imgExtension = contentData.CollectionContent[i].ImageData.AdditionalFormatFileExt;
                var currentImage= "../../AaltoGlobalImpact.OIP/MediaContent/"+imgID+"_320x240_crop"+imgExtension;
            }
            $("#viewContentModal-image").empty(); //clean the image Placeholder in the form
            queryValue = "<img src='"+currentImage+"' style='width:auto;height:auto;max-width:350;max-height:450px;margin-left:auto;margin-right:auto;'>";
            $("#viewContentModal-image").append(queryValue);


            $("#viewContentModal-iframes").empty();
            $.each(iFrameList, function(index, value) {
                $("#viewContentModal-iframes").append(value);
            });

            $("#viewContentModal-attachments").empty();

            //var myAttachments = getObjectAttachments(currentID);
            var myAttachments = [];
            if(myAttachments.length > 0) {
                var myBinaries = [];
                for(var attachmentIX = 0; attachmentIX < myAttachments.length; attachmentIX++)
                {
                    var currAttachment = myAttachments[attachmentIX];
                    var binaryFileID = currAttachment.SourceObjectID;
                    var attachedBinary = getBinaryFile(binaryFileID);
                    if(attachedBinary && attachedBinary.Data)
                        myBinaries.push(attachedBinary);
                }
                myBinaries.sort(function(a, b) {
                    if(a && b && a.OriginalFileName && b.OriginalFileName)
                        return a.OriginalFileName.localeCompare(b.OriginalFileName);
                    return 0;
                });
                for(var binaryIX = 0; binaryIX < myBinaries.length; binaryIX++)
                {
                    var currBinary = myBinaries[binaryIX];
                    var data = currBinary.Data;
                    var contentID = data.ID;
                    var originalFileName = currBinary.OriginalFileName;
                    var binaryUrl = encodeURI("../../AaltoGlobalImpact.OIP/MediaContent/" + contentID + "/" + originalFileName);
                    var binaryLinkTag = '<br><a href="' + binaryUrl +  '">' + originalFileName + '</a><br>';
                    $("#viewContentModal-attachments").append(binaryLinkTag);
                }

            }

            var $modal = $("#viewContentModal");
            $modal.foundation('reveal', 'open');
            setTimeout(function() {
                ResizeModalRows($modal);
            }, 400);
        }
    });
    return;
};

var ResizeModalRows = function($modalFrame) {
    var parentForRows = $modalFrame;
    //alert(parentForRows.prop("tagName") + ": " + parentForRows.attr("class"));
    var fullParentHeight = parentForRows.height();
    var rows = parentForRows.children(".row");
    var totalHeight = 0;
    rows.each(function(item) {
        var row = $(this);
        totalHeight += row.height();
    });
    var remainingHeightRows = parentForRows.children(".row.remainingHeight");
    if(remainingHeightRows.length < 1)
        return;
    var remainingHeight = 0;
    remainingHeightRows.each(function(item) {
        var row = $(this);
        remainingHeight += row.height();
    });
    //alert(fullParentHeight + " " + totalHeight + " " + remainingHeight);
    var spaceLeftForRemainingRows = fullParentHeight - totalHeight + remainingHeight;
    var eachRemainingRowHeight = spaceLeftForRemainingRows / remainingHeightRows.length;
    //alert(eachRemainingRowHeight);
    //alert(spaceLeftForRemainingRows);
    remainingHeightRows.each(function(item) {
        var row = $(this);
        row.height(eachRemainingRowHeight);
    });
    //alert("resized...");
};

$(function() {
    /*$(".oipclicktoview").on('click', OipOpenArticle);*/
    $(document).on("click", ".oipclicktoview", OipOpenArticle);
    $(document).foundation(
        {
            reveal : {
                animation: 'fadeAndPop',
                animation_speed: 250,
                close_on_background_click: false
            }

        }
    );
    $(".close-reveal-modal").on("click", function() {

    });

    $("#closeViewContentModal").on("click", function() {
        $("#viewContentModal").foundation("reveal", "close");
    });

    $(".catnavaction").on("click", function() {
        var categoryID = $(this).data("cat");
        var contentID = $(this).data("con");
        openArticle(GetArticleTypeFromID(contentID), contentID, categoryID);
        return false;
    });
});

var openArticle = function (articleType, articleID) {
    var articleUrl;
    if(articleType == "text")
        articleUrl = "../../AaltoGlobalImpact.OIP/TextContent/" + articleID + ".json";
    OipOpenArticle(articleUrl, false);
}


