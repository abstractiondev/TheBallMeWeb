/**
 * Created by Kalle on 4.9.2014.
 */
ReplaceIFrameTagsWithMarkup = function(inputString) {
    /*
     * Regex: <iframe (.*)>.*</iframe>
     * Replace: [:iframe $1]
     *
     * or back
     *
     * Regex: \[:iframe (.*)\]
     * <iframe $1><iframe>
     *
     * */

    //var pattern = /<iframe (.*)>.*</iframe>/g;
    var pattern = new RegExp("<iframe ([\\s\\S]*?)>[\\s\\S]*?</iframe>", "g");
    return inputString.replace(pattern, "[:iframe $1]");
};

RemoveIFrameTags = function(inputString) {
    /*
     * Regex: <iframe (.*)>.*</iframe>
     * Replace: [:iframe $1]
     *
     * or back
     *
     * Regex: \[:iframe (.*)\]
     * <iframe $1><iframe>
     *
     * */

    //var pattern = /<iframe (.*)>.*</iframe>/g;
    var pattern = new RegExp("<iframe ([\\s\\S]*?)>[\\s\\S]*?</iframe>", "g");
    return inputString.replace(pattern, "$1");
};

ReplaceIFrameMarkupWithTags = function(inputString) {
    return inputString.replace(new RegExp("\\[:iframe (.*)\\]", "g"), "<iframe $1><iframe>");
};

$(document).on('focusout', '.oippreprocess', function() {
    var $me = $(this);
    var currval = $me.val();
    var functionName = $me.data("preprocessor");
    //currval = ReplaceIFrameTagsWithMarkup(currval);
    currval = window[functionName](currval);
    $me.val(currval);
});

$(document).on("paste", ".oippreprocess", function() {
    var $me = $(this);
    setTimeout(function () {
        var currval = $me.val();
        var functionName = $me.data("preprocessor");
        //currval = ReplaceIFrameTagsWithMarkup(currval);
        currval = window[functionName](currval);
        $me.val(currval);
    }, 100);

});
