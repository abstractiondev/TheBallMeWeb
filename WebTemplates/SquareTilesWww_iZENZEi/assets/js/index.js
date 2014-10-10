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
    return semanticCollection;
}, [ "../../AaltoGlobalImpact.OIP/TextContentCollection/MasterCollection.json",
    "../../AaltoGlobalImpact.OIP/LinkToContentCollection/MasterCollection.json",
    "../../AaltoGlobalImpact.OIP/EmbeddedContentCollection/MasterCollection.json",
    "../../AaltoGlobalImpact.OIP/CategoryCollection/MasterCollection.json",
]);

tUDG.RegisterDataURL("CATEGORYRANKS", function (args) {
    var contentCategoryRanks = args[0][0];
    console.log(JSON.stringify(contentCategoryRanks));
    var semanticContents = args[1];
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
        SemanticContentMap : semanticContentCategoryMap
    };
}, [
    "../../AaltoGlobalImpact.OIP/ContentCategoryRankCollection/MasterCollection.json",
    "SEMANTICCONTENT"
]);

$(function() {
    tUDG.GetData("CATEGORYRANKS", function(data) {
        console.log(JSON.stringify(data));
    });
});