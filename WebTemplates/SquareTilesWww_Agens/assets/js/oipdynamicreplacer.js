/**
 * Created by Kalle on 26.8.2014.
 */
$(document).ready(function () {
    console.log("Dynamic Replacer Ready Indicator (should be after all replacements)!");
});
$.holdReady(true);
var OIPDynamicReplacementData = [];
console.log("Initiating fetch for Dynamic Content JSON...");
$.getJSON("../../AaltoGlobalImpact.OIP/DynamicContentCollection/MasterCollection.json", function (contentData) {
    console.log("Processing json...");
    OIPDynamicReplacementData = contentData.CollectionContent;
    OIPDoActiveReplace(OIPDynamicReplacementData, false);
    $.holdReady(false);
});

var OIPDoActiveReplace = function(dynamicDataCollection, activeOnly) {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    //var currentPage = document.location.href.match(/[^\/]+$/)[0];
    var currentPage = page;
    for (var i = 0; i < dynamicDataCollection.length; i++) {
        var currDynamic = dynamicDataCollection[i];
        if (currDynamic.HostName == currentPage) {
            if(currDynamic.ApplyActively || !activeOnly) {
                var $ph = $(currDynamic.ElementQuery);
                // console.log("Dynamic '" + currDynamic.ContentName + "' replacing all tags matching: " + currDynamic.ElementQuery + " = total " + $ph.length);
                if(currDynamic.RawContent) {
                    console.log("RAW Dynamic '" + currDynamic.ContentName + "' replacing all tags matching: " + currDynamic.ElementQuery + " = total " + $ph.length);
                    $ph.html(currDynamic.RawContent);
                }
                else {
                    console.log("Dynamic '" + currDynamic.ContentName + "' replacing all tags matching: " + currDynamic.ElementQuery + " = total " + $ph.length);
                    $ph.html(currDynamic.Content);
                }
            }
        } else {
            // console.log("Not matching page: " + currentPage + " vs. " + currDynamic.HostName);
        }
    }
};

var OIPActiveDynamicReplace = function() {
    //console.log("Processing active DynamicContent...");
    OIPDoActiveReplace(OIPDynamicReplacementData, true);
    //console.log("Processing active DynamicContent done!");
};
