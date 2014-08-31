/**
 * Created by Kalle on 26.8.2014.
 */
$(document).ready(function () {
    console.log("Dynamic Replacer Ready Indicator (should be after all replacements)!");
});
$.holdReady(true);
console.log("Initiating fetch for Dynamic Content JSON...");
$.getJSON("../../AaltoGlobalImpact.OIP/DynamicContentCollection/MasterCollection.json", function (contentData) {
    console.log("Processing json...");
    var currentPage = document.location.href.match(/[^\/]+$/)[0];
    for (var i = 0; i < contentData.CollectionContent.length; i++) {
        var currDynamic = contentData.CollectionContent[i];
        if (currDynamic.HostName == currentPage) {
            var $ph = $(currDynamic.ElementQuery);
            console.log("Dynamic '" + currDynamic.ContentName + "' replacing all tags matching: " + currDynamic.ElementQuery + " = total " + $ph.length);
            if(currDynamic.RawContent) {
                console.log("RAW Dynamic '" + currDynamic.ContentName + "' replacing all tags matching: " + currDynamic.ElementQuery + " = total " + $ph.length);
                $ph.html(currDynamic.RawContent);
            }
            else {
                console.log("Dynamic '" + currDynamic.ContentName + "' replacing all tags matching: " + currDynamic.ElementQuery + " = total " + $ph.length);
                $ph.html(currDynamic.Content);
            }
        }
    }
    $.holdReady(false);
});
