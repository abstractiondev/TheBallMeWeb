/**
 * Created by kalle on 12.2.2014.
 */

String.prototype.replaceAll = function(strReplace, strWith) {
    var reg = new RegExp(strReplace, 'ig');
    return this.replace(reg, strWith);
};

var PerformQuery = function() {
    var queryInputPhrase = $("#queryInputPhrase").val();
    var promise = $.ajax({
        url: "?operation=TheBall.Index.PerformUserQuery",
        contentType: "application/json",
        data: '{ "QueryString": "' + queryInputPhrase + '", "DefaultFieldName": "Body"}',
        type: "POST"
    });
    $.when(promise).then(function(jsonData) {
        var templateName = "searchresultsTest.dust";
        var url = "../../" + jsonData.QueryRequestObjectDomainName + "/" + jsonData.QueryRequestObjectName + "/" + jsonData.QueryRequestObjectID + ".json";
        tMgr.RegisterAndReplaceTemplate(templateName, ".searchresultsContainer",
            [ url ],

            function (jsonArray) {
                var json = jsonArray[0];
                var content = json.GetObjectContent();
                return content;
            },
            function (jsonArray) {
                //activateIsotope();
                ///bindView();
                //bindEdit();
            },
            function(jsonArray, $hiddenElements) {
                $hiddenElements.each(function() {
                    $(this).html("Invisible...");
                });
            }
        );
        tMgr.ActivateNamedTemplates([ templateName]);
    });
};


var SaveCategoryHierarchy = function () {
    var e = $("#nesttest");
    var list = e.length ? e : $(e.target);
    /*output = list.data('output');*/
    var jsonData;
    if (window.JSON) {
        jsonData = window.JSON.stringify(list.nestable('serialize'));
        /*alert(jsonData);*/
    } else {
        /*output.val('JSON browser support required for this demo.');*/
    }
    $.ajax(
        { type: "POST",
            url: "?operation=AaltoGlobalImpact.OIP.SetCategoryHierarchyAndOrderInNodeSummary",
            //dataType: "json",
            contentType: "application/json",
            data: jsonData,
            success: function () {
            },
            error: function(request,error) {
                console.log(arguments);
                alert ( "Error in saving: " + error );
                window.location.reload(true);
            }
        }
    );
};

/*
 var testCreateObject = function() {
 tOP.CreateObject("AaltoGlobalImpact.OIP", "TextContent",
 {Title: "Test title!", Excerpt: "Many\nThanks\n", Body:"Many\nThanks!!\n"});
 };
 */
//------begins: triggers the event if the "EDIT" button in the content card is pressed... on ANY of them
var bindEdit = function () {
    $("[id*='editContentButton-dataID']").click(function (editEvent) {
        var clickedEditID = editEvent.target.id.replace("editContentButton-dataID-", '');
        var textContentUrl = "../../AaltoGlobalImpact.OIP/TextContent/" + clickedEditID + ".json";
        $.ajax({ url: textContentUrl, cache: true,
            success: function (textContentData) {
            markdown = new MarkdownDeep.Markdown();
            markdown.SafeMode = true;
            //var excerptRendered = markdown.Transform(textContentData.Excerpt.replaceAll("javascript:", ""));
            //textContentData.ExcerptRendered = excerptRendered;
            //var excerptRendered = markdown.Transform(textContentData.Excerpt.replaceAll("javascript:", ""));
            textContentData.ExcerptRendered = textContentData.Excerpt;
            //var bodyRendered = markdown.Transform(textContentData.Body.replaceAll("javascript:", ""));
            //textContentData.BodyRendered = bodyRendered;
            textContentData.BodyRendered = textContentData.Body;
            var queryValue = "";
            var contentItem = getCardContentFromTextContent(textContentData, 256);
            var contentData = { "content": [ contentItem ]};
            for (var i in contentData.content) {
                if (contentData.content[i].id === clickedEditID) {
                    queryValue = clickedEditID;
                    $('#editContentModal-id').val(queryValue);
                    queryValue = $("#editContentModal-id").val();
                    $("#placeholder-panel4a").text(queryValue);

                    queryValue = contentData.content[i].title;
                    $('#editContentModal-title').val(queryValue);

                    queryValue = contentData.content[i].excerpt;
                    $('#editContentModal-excerpt').val(queryValue);

                    queryValue = contentData.content[i].content_type;
                    $('#editContentModal-categories').val(queryValue);

                    queryValue = contentData.content[i].article_text;
                    $('#editContentModal-content').val(queryValue);

                    queryValue = contentData.content[i].image;
                    $('#editContentModal-imagePath').val(queryValue);
                    queryValue = $("#editContentModal-imagePath").val();
                    $("#placeholder-panel4a").text(queryValue);

                    //send the correspondent image to the placeholder, but clean its containing div first
                    $("#editContentModal-image").empty(); //clean the image Placeholder in the form
                    queryValue = "<img src='" + contentData.content[i].image + "' style='width:320px;height:auto;max-height:350px;margin-left:auto;margin-right:auto;'>";
                    $("#editContentModal-image").append(queryValue);
                } //ends If
            }//ends for loop
        }}); //ends getJson
        $('#editContentModal').foundation('reveal', 'open');
    });//----------ends: triggers the event if the "EDIT" button in the content card is presed... on ANY of them
}

//------begins: triggers the event if the "VIEW" button in the content card is pressed... on ANY of them
var getCardContentFromTextContent = function (item, imageSizeString) {
    var imageUrl = item.ImageData
        ? "../../AaltoGlobalImpact.OIP/MediaContent/" + item.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + item.ImageData.AdditionalFormatFileExt
        : null;
    var currExcerpt = item.ExcerptRendered ? item.ExcerptRendered : item.Excerpt;
    var currArticleText = item.BodyRendered ? item.BodyRendered : item.Body;
    return { "id": item.ID, "title": item.Title, "excerpt": currExcerpt,
        "article_text": currArticleText,
        "image": imageUrl,
        "itemUrl": "../../AaltoGlobalImpact.OIP/TextContent/" + item.ID + ".json"
    };

};


var ConvertCategoriesFromParentToChildren = function (categoryArray) {
    var map = {};
    map["-"] = {
        UI_ChildrenCategories: []
    };
    for (var i = 0; i < categoryArray.length; i++) {
        var obj = categoryArray[i];
        obj.UI_ChildrenCategories = [];
        map[obj.ID] = obj;
    }
    for (var i = 0; i < categoryArray.length; i++) {
        var obj = categoryArray[i];
        var parentID = obj.ParentCategoryID ? obj.ParentCategoryID : "-";
        if (!map[parentID]) {
            map[parentID] = {
                UI_ChildrenCategories: []
            };
        }
        map[parentID].UI_ChildrenCategories.push(obj);
    }
    if (categoryArray.length == 0)
        return [];
    return map["-"].UI_ChildrenCategories;
};

var FixTreeViewChildrenAndTitles = function(uiCategoryArray) {
    if(!uiCategoryArray)
        return;
    for(var i = 0; i < uiCategoryArray.length; i++) {
        var category = uiCategoryArray[i];
        if(category) {
            category.title = category.NativeCategoryTitle;
            category.children = category.UI_ChildrenCategories;
            FixTreeViewChildrenAndTitles(category.children);
        }
    }
};


var bindView = function () {
    $("[id*='viewContentButton-dataID']").click(function (editEvent) {
        var clickedEditID = editEvent.target.id.replace("viewContentButton-dataID-", '');
        var textContentUrl = "../../AaltoGlobalImpact.OIP/TextContent/" + clickedEditID + ".json";
        $.ajax({ url: textContentUrl, cache: true,
            success: function (textContentData) {
                markdown = new MarkdownDeep.Markdown();
                markdown.SafeMode = true;
                var excerptRendered = markdown.Transform(textContentData.Excerpt.replaceAll("javascript:", ""));
                textContentData.ExcerptRendered = excerptRendered;
                var bodyRendered = markdown.Transform(textContentData.Body.replaceAll("javascript:", ""));
                textContentData.BodyRendered = bodyRendered;

                var content = getCardContentFromTextContent(textContentData, "256");
                var queryValue = "";

                queryValue = content.title;
                $("#viewContentModal-title").empty();
                $('#viewContentModal-title').append(queryValue);

                queryValue = "<p>" + content.excerpt + "</p>";
                $("#viewContentModal-excerpt").empty();
                $('#viewContentModal-excerpt').append(queryValue);

                queryValue = "<p style='font-size: 85%;float:right !important;'>Categorized as: " + content.content_type + "</p>";
                $("#viewContentModal-categories").empty();
                $('#viewContentModal-categories').append(queryValue);

                queryValue = content.article_text;
                $("#viewContentModal-content").empty();
                $('#viewContentModal-content').append(queryValue);

                //send the correspondent image to the placeholder, but clean its containing div first
                $("#viewContentModal-image").empty(); //clean the image Placeholder in the form
                queryValue = "<img src='" + content.image + "' style='width:auto;height:auto;max-width:350;max-height:450px;margin-left:auto;margin-right:auto;'>";
                $("#viewContentModal-image").append(queryValue);
            }
        }) //ends getJson
        $('#viewContentModal').foundation('reveal', 'open');
    });//-------ends: triggers the event if the "VIEW" button in the content card is pressed... on ANY of them
}

/*
 $.Isotope.prototype.flush = function() {
 this.$allAtoms = $();
 this.$filteredAtoms = $();
 this.element.children().remove();
 this.reLayout();
 };*/


var activateIsotope = function () {
    var $container = $('.portfolioContainer');
    $container.isotope('reloadItems');
    $container.isotope({
        filter: '*',
        animationOptions: {
            duration: 750,
            easing: 'linear',
            queue: false
        }
    });
    $('.portfolioFilter a').click(function () {
        $('.portfolioFilter .current').removeClass('current');
        $(this).addClass('current');

        var selector = $(this).attr('data-filter');
        $container.isotope({
            filter: selector,
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });
        return false;
    });

};

var tUI = TheBall.Interface.UI;
var tMgr = new tUI.TemplateModuleManager();
var renderCount = 0;
tMgr.RegisterTemplate("content.dust", ".portfolioContainer",
    [ "../../AaltoGlobalImpact.OIP/TextContentCollection/MasterCollection.json" ],

    function (jsonArray) {
        var json = jsonArray[0];
        var content = json.GetObjectContent();
        markdown = new MarkdownDeep.Markdown();
        markdown.SafeMode = true;
        var realContent =
        {
            "content": $.map(content.CollectionContent, function (item) {
                var rendered = markdown.Transform(item.Excerpt.replaceAll("javascript:", ""));
                item.ExcerptRendered = rendered;
                return getCardContentFromTextContent(item, "64");
            })
        };
        return realContent;
    },
    function (jsonArray) {
        activateIsotope();
        bindView();
        bindEdit();
    },
    function(jsonArray, $hiddenElements) {
        $hiddenElements.each(function() {
            $(this).html("Invisible...");
        });
    }
);
tMgr.RegisterTemplate("categoryTreeEditor.dust", ".categoryTreeEditor",
    [ "../../AaltoGlobalImpact.OIP/NodeSummaryContainer/default.json"],
    function (jsonArray) {
        var json = jsonArray[0];
        var content = json.GetObjectContent();
        var CategoriesWithChildren = ConvertCategoriesFromParentToChildren(content.NodeSourceCategories.CollectionContent);
        return { "CategoriesWithChildren": CategoriesWithChildren };
    },
    function (jsonArray) {
        // TODO: Editor refresh
        $('.dd').nestable({ });
    },
    function(jsonArray, $hiddenElements) {
        $hiddenElements.each(function() {
            $(this).html("Invisible...");
        });
    }
);

tMgr.RegisterTemplate("groupsettings.dust", ".groupsettings",
    ["../../AaltoGlobalImpact.OIP/GroupContainer/default.json"],
    function(jsonArray) {
        var json = jsonArray[0];
        var content = json.GetObjectContent();
        return { "GroupContainer": content };
    },
    function(jsonArray) {
        // Editor refresh (if any)
    },
    function(jsonArray, $hiddenElements) {
        $hiddenElements.each(function() {
            $(this).html("Invisible...");
        });
    }

);

tMgr.RegisterTemplate("searchWithResults.dust", ".searchWithResults",
    [],
    function(jsonArray) {
        return {};
    },
    function(jsonArray) {

    },
    function(jsonArray, $hiddenElements) {
        $hiddenElements.each(function() {
            $(this).html("Invisible...");
        });
    }
);

var GLOCurrentConnections;

var GetConnectionByID = function (connectionID) {
    if(!GLOCurrentConnections)
        return null;
    for(var i = 0; i < GLOCurrentConnections.CollectionContent.length; i++)
    {
        var conn = GLOCurrentConnections.CollectionContent[i];
        if(conn.ID === connectionID)
            return conn;
    }
    return null;
};

tMgr.RegisterTemplate("connections.dust", ".categoryConnections",
    ["../../TheBall.Interface/ConnectionCollection/MasterCollection.json"],
    function(jsonArray) {
        var json = jsonArray[0];
        var content = json.GetObjectContent();
        var alertStr = JSON.stringify(content);
        //alert(alertStr);
        var i;
        for(i = 0; i < content.CollectionContent.length; i++) {
            var conn = content.CollectionContent[i];
            var thisSideCategories = ConvertCategoriesFromParentToChildren(conn.ThisSideCategories);
            FixTreeViewChildrenAndTitles(thisSideCategories);
            //alert(JSON.stringify(thisSideCategories));
            conn.UI_ThisSideCategories = thisSideCategories;
            var otherSideCategories = ConvertCategoriesFromParentToChildren(conn.OtherSideCategories);
            FixTreeViewChildrenAndTitles(otherSideCategories);
            //alert(JSON.stringify(otherSideCategories));
            conn.UI_OtherSideCategories = otherSideCategories;
        }
        GLOCurrentConnections = content;
        return { "Connections": content };
    },
    function(jsonArray) {

    },
    function(jsonArray, $hiddenElements) {

    }
);

$(function () {
    /*
    tMgr.ActivateAllTemplates();

    // Data update polling
    (function poll() {
        setTimeout(function () {
            tMgr.DCM.PerformAsyncPoll();
            poll();
        }, 5000);
    })();
    // UI visibility update polling
    (function poll() {
        setTimeout(function() {
            tMgr.RefreshAllTemplateVisibility();
            poll();
        }, 500);
    })();
    */
});
