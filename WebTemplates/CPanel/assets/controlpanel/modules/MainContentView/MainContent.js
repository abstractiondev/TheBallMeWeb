/**
 * Created by kalle on 14.6.2014.
 */


var CommentCollection;
var GetCommentCountForItemID = function(itemID) {
    var itemComments = $.grep(CommentCollection.CollectionContent, function(elem, index) {
        return elem.TargetObjectID === itemID;
    });
    return itemComments.length;
};

var initializeTextContents = function(contentData, commentData)
{
    CommentCollection = commentData;
    var user_content="";
    var newscounter=1;
    var importantcounter = 1;

    for (var i in contentData.CollectionContent) {
        var currentObject=contentData.CollectionContent[i];

        /*var aproxCardSize=210;*/
        var currentID=currentObject.ID;
        var currentTitle=currentObject.Title ? currentObject.Title : "";
        var currentExcerpt=currentObject.Excerpt;
        var currentAuthor=currentObject.Author;
        var currentPublishedDate=ParseRawTimestampToDateString(currentObject.Published);
        var imageSizeString="256";

        var currentImagePath=currentObject.ImageData
            ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
            : null;

        var currentMainCategory;

        if(!currentObject.Categories|| !currentObject.Categories.CollectionContent ||
            !currentObject.Categories.CollectionContent.length)
            currentMainCategory="";
        else
            currentMainCategory=currentObject.Categories.CollectionContent[0].Title;

        var numberOfComments=GetCommentCountForItemID(currentID);

        var isInternal = false;
        var backgroundColorStyle = "";

        if(currentObject.Categories && currentObject.Categories.CollectionContent) {
            var internalArray = $.grep(currentObject.Categories.CollectionContent, function(internalCandidate) {
                return internalCandidate.Title == "INTERNAL";
            });
            isInternal = internalArray.length > 0;
            if(isInternal) {
                console.log("Internal filter: " + currentTitle);
                backgroundColorStyle = "background-color: #d3d3d3;";
            }
        }

        user_content+="<div class='content-card "+currentMainCategory+"' id='contentCardDataId-"+currentID+"'>";
        if(currentImagePath)
            user_content+="<img src='"+currentImagePath+"' alt='image' id='contentCardImage-dataID-"+currentID+"'/>";
        user_content+="<div class='content-card-title' style='font-size:95%; font-weight:bold; column-rule: #000000;" + backgroundColorStyle + "' id='contentCardTitle-dataID-"+currentID+"'>"+currentTitle+"</div>";
        user_content+="<div class='content-card-options'><a class='editContentButton oip-controller-command' id='editContentButton-dataID-"+currentID+"' data-oip-command='EditContent' data-objectid='" + currentID + "'>Edit&nbsp;</a><a class='oip-controller-command' id='viewContentButton-dataID-"+currentID+"' data-oip-command='ViewContent' data-oip-command-args='" + currentID + "'>&nbsp;View&nbsp;</a><a class='oip-controller-command' data-oip-command='DeleteContent' data-objectid='" +currentID+ "'>&nbsp;Trash&nbsp;</a><a class='content-card-options-right hide' id='toggleVisibilityContentButton-dataID-"+currentID+"'><i class='icon-eye-open' style='font-size:110%;'></i></a></div>";
        user_content+="<div class='content-card-line'><hr></div>";
        user_content+="<div class='content-card-options'><a class='commentContentButton oip-controller-command' data-oip-command='ViewContent' data-oip-command-args='" + currentID + "' id='contentAddCommentButton-dataID-"+currentID+"'><i class='icon-pencil'></i>&nbsp;Comment&nbsp;</a><span class='content-card-options-right' id='contentNumberOfComments-dataID-"+currentID+"'>"+numberOfComments+"&nbsp;<i class='icon-commentround'></i></span></div>";
        user_content+="</div>";

        var isNews = currentMainCategory=="News";
        if (isNews && newscounter<4){
            $("#news"+newscounter+"date").empty();
            $("#news"+newscounter+"date").append(currentPublishedDate);
            var currentnewstext="<a>"+currentTitle+". "+currentExcerpt+"</a>";
            $("#news"+newscounter+"text").empty();
            $("#news"+newscounter+"text").append(currentnewstext);
            newscounter++;
        }
        var isImportant = currentMainCategory=="Events";
        if (isImportant && importantcounter<4){
            $("#important"+importantcounter+"date").empty();
            $("#important"+importantcounter+"date").append(currentPublishedDate);
            var currentimportanttext="<a>"+currentTitle+". "+currentExcerpt+"</a>";
            $("#important"+importantcounter+"text").empty();
            $("#important"+importantcounter+"text").append(currentimportanttext);
            importantcounter++;
        }
    }
    return user_content;
};

var initializeLinkToContents = function(contentData, commentData)
{
    CommentCollection = commentData;
    var user_content="";

    for (var i in contentData.CollectionContent) {
        var currentObject=contentData.CollectionContent[i];

        /*var aproxCardSize=210;*/
        var currentID=currentObject.ID;
        var currentTitle=currentObject.Title ? currentObject.Title : "";
        var imageSizeString="256";

        var currentImagePath=currentObject.ImageData
            ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
            : null;

        var currentMainCategory;

        if(!currentObject.Categories|| !currentObject.Categories.CollectionContent ||
            !currentObject.Categories.CollectionContent.length)
            currentMainCategory="";
        else
            currentMainCategory=currentObject.Categories.CollectionContent[0].Title;

        var numberOfComments=GetCommentCountForItemID(currentID);

        var isInternal = false;
        var backgroundColorStyle = "";

        if(currentObject.Categories && currentObject.Categories.CollectionContent) {
            var internalArray = $.grep(currentObject.Categories.CollectionContent, function(internalCandidate) {
                return internalCandidate.Title == "INTERNAL";
            });
            isInternal = internalArray.length > 0;
            if(isInternal) {
                console.log("Internal filter: " + currentTitle);
                backgroundColorStyle = "background-color: #d3d3d3;";
            }
        }

        user_content+="<div class='content-card "+currentMainCategory+"' id='contentCardDataId-"+currentID+"'>";
        if(currentImagePath)
            user_content+="<img src='"+currentImagePath+"' alt='image' id='contentCardImage-dataID-"+currentID+"'/>";
        user_content+="<div class='content-card-title' style='font-size:95%; font-weight:bold; column-rule: #000000;" + backgroundColorStyle + "' id='contentCardTitle-dataID-"+currentID+"'>"+currentTitle+"</div>";
        user_content+="<div class='content-card-options'><a class='editContentButton oip-controller-command' id='editContentButton-dataID-"+currentID+"' data-oip-command='EditLinkToContent' data-objectid='" + currentID + "'>Edit&nbsp;</a><a class='oip-controller-command' id='viewContentButton-dataID-"+currentID+"' data-oip-command='ViewLinkToContent' data-oip-command-args='" + currentID + "'>&nbsp;View&nbsp;</a><a class='oip-controller-command' data-oip-command='DeleteLinkToContent' data-objectid='" +currentID+ "'>&nbsp;Trash&nbsp;</a><a class='content-card-options-right hide' id='toggleVisibilityContentButton-dataID-"+currentID+"'><i class='icon-eye-open' style='font-size:110%;'></i></a></div>";
        user_content+="<div class='content-card-line'><hr></div>";
        user_content+="<div class='content-card-options'><a class='commentContentButton' id='contentAddCommentButton-dataID-"+currentID+"'><i class='icon-pencil'></i>&nbsp;Comment&nbsp;</a><span class='content-card-options-right' id='contentNumberOfComments-dataID-"+currentID+"'>"+numberOfComments+"&nbsp;<i class='icon-commentround'></i></span></div>";
        user_content+="</div>";
    }
    return user_content;
};

var initializeEmbeddedContents = function(contentData, commentData)
{
    CommentCollection = commentData;
    var user_content="";

    for (var i in contentData.CollectionContent) {
        var currentObject=contentData.CollectionContent[i];

        /*var aproxCardSize=210;*/
        var currentID=currentObject.ID;
        var currentTitle=currentObject.Title ? currentObject.Title : "";
        var imageSizeString="256";

        var currentImagePath=currentObject.ImageData
            ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
            : null;

        var currentMainCategory;

        if(!currentObject.Categories|| !currentObject.Categories.CollectionContent ||
            !currentObject.Categories.CollectionContent.length)
            currentMainCategory="";
        else
            currentMainCategory=currentObject.Categories.CollectionContent[0].Title;

        var numberOfComments=GetCommentCountForItemID(currentID);

        var isInternal = false;
        var backgroundColorStyle = "";

        if(currentObject.Categories && currentObject.Categories.CollectionContent) {
            var internalArray = $.grep(currentObject.Categories.CollectionContent, function(internalCandidate) {
                return internalCandidate.Title == "INTERNAL";
            });
            isInternal = internalArray.length > 0;
            if(isInternal) {
                console.log("Internal filter: " + currentTitle);
                backgroundColorStyle = "background-color: #d3d3d3;";
            }
        }

        user_content+="<div class='content-card "+currentMainCategory+"' id='contentCardDataId-"+currentID+"'>";
        if(currentImagePath)
            user_content+="<img src='"+currentImagePath+"' alt='image' id='contentCardImage-dataID-"+currentID+"'/>";
        user_content+="<div class='content-card-title' style='font-size:95%; font-weight:bold; column-rule: #000000;" + backgroundColorStyle + "' id='contentCardTitle-dataID-"+currentID+"'>"+currentTitle+"</div>";
        user_content+="<div class='content-card-options'><a class='editContentButton oip-controller-command' id='editContentButton-dataID-"+currentID+"' data-oip-command='EditEmbeddedContent' data-objectid='" + currentID + "'>Edit&nbsp;</a><a class='oip-controller-command' id='viewContentButton-dataID-"+currentID+"' data-oip-command='ViewEmbeddedContent' data-oip-command-args='" + currentID + "'>&nbsp;View&nbsp;</a><a class='oip-controller-command' data-oip-command='DeleteEmbeddedContent' data-objectid='" +currentID+ "'>&nbsp;Trash&nbsp;</a><a class='content-card-options-right hide' id='toggleVisibilityContentButton-dataID-"+currentID+"'><i class='icon-eye-open' style='font-size:110%;'></i></a></div>";
        user_content+="<div class='content-card-line'><hr></div>";
        user_content+="<div class='content-card-options'><a class='commentContentButton' id='contentAddCommentButton-dataID-"+currentID+"'><i class='icon-pencil'></i>&nbsp;Comment&nbsp;</a><span class='content-card-options-right' id='contentNumberOfComments-dataID-"+currentID+"'>"+numberOfComments+"&nbsp;<i class='icon-commentround'></i></span></div>";
        user_content+="</div>";
    }
    return user_content;
};


var initializeContent = function(textContentData, linkToContentData, embeddedContentData, commentData) {
    var user_content = initializeTextContents(textContentData, commentData);
    user_content += initializeLinkToContents(linkToContentData, commentData);
    user_content += initializeEmbeddedContents(embeddedContentData, commentData);
    Foundation.libs.equalizer.reflow();
    $("#contentDivContainer").append(user_content).isotope('reLayout');
};

var start_isotope = function(){
    var $container = $("#contentDivContainer");
    $container.isotope({
        filter: '*',
        animationOptions: {
            duration: 750,
            easing: 'linear',
            queue: false
        }
    });

    $('.portfolioFilter a').click(function(){
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
}

var reLayout_isotope = function() {
    var $container = $('#contentDivContainer');
    $container.isotope( 'reLayout');
};

var initializeAll = function () {

    $(document).foundation(
        {
            reveal: {
                animation: 'fadeAndPop',
                animation_speed: 250,
                close_on_background_click: false,
                close_on_esc: false
            }

        }
    );

    $.ajaxSetup({cache: true});

    $("#portfolioFilterDivContainer").delegate("a", { click: filter_isotope_items });
    $(document).on('close', '[data-reveal]', reLayout_isotope);
    $("#contentPanelTab").on('click mouseover', setTimeout('reLayout_isotope', 2000));
    $(".offCanvasMenuAnchor").on('click', switchActiveCanvasSection);
    $("#fileTab").on('click', get_files);
    $("#cancel-deleteContentModal").on('click', close_contentDelete_confirm);
    $("#confirm-deleteModal-submit").on('click', submit_contentDelete_confirm);
    $("#contentDivContainer").on('mouseover', reLayout_isotope);
    $("#cancelEditContentModal").click(function () {
        $('#editContentModal').foundation('reveal', 'close');
    });
    $("#closeViewContentModal").click(function () {
        $('#viewContentModal').foundation('reveal', 'close');
    });
    $("#close-alert-pageSave-successful-a").click(function () {
        $('#alert-pageSave-successful').foundation('reveal', 'close');
    });
    $("#create-group-button").click(function () {
        $('#create-group-modal').foundation('reveal', 'open');
    });
    $("#addNewContentAttachmentAlertHOLDER").delegate(".alertAnchorClose", { click: closeAlertDynamicNotification });

}

var global_uploaded_attachments = 0;

function getAttachments() {
    if(!allAttachments) {
        $.getJSON("../../AaltoGlobalImpact.OIP/AttachedToObjectCollection/MasterCollection.json", function(attachments) {
            allAttachments = attachments;
        });
    }
}

function getBinaries() {
    if(!allBinaryFiles) {
        $.getJSON("../../AaltoGlobalImpact.OIP/BinaryFileCollection/MasterCollection.json", function(binaryFiles) {
            allBinaryFiles = binaryFiles;
        });
    }
}

var allAttachments;
var allBinaryFiles;

var getObjectAttachments = function (objectID) {
    if(!allAttachments)
        return [];
    var result = [];
    for(var i = 0; i < allAttachments.CollectionContent.length; i++) {
        var attachment = allAttachments.CollectionContent[i];
        if(attachment.TargetObjectID == objectID)
            result.push(attachment);
    }
    return result;
};

var getBinaryFile = function (binaryFileID) {
    if(!allBinaryFiles)
        return null;
    for(var i = 0; i < allBinaryFiles.CollectionContent.length; i++) {
        var binaryFile = allBinaryFiles.CollectionContent[i];
        if(binaryFile.ID == binaryFileID)
            return binaryFile;
    }
    return null;
};



function closeAlertDynamicNotification() {

    var $alertboxClicked = $(this).closest('.alert-box');
    var alertboxClickedID = $alertboxClicked.attr('id')
    /*$("#"+alertboxClickedID).foundation('alert-box', 'close');*/
    $("#" + alertboxClickedID).removeClass("alert-box").removeClass("secondary").removeClass("articleText2").addClass("hide");
    /*console.log("You just clicked the closing button of the foundation alert!.Clicked id: "+$alertboxClicked.attr('id'));*/
    console.log("You just clicked the closing button of the foundation alert!.Clicked id: " + alertboxClickedID);

}

var saveNewComment = function (commentText, parentTextContentID) {
    var saveData =
    {
        CommentText: commentText,
        TargetObjectID: parentTextContentID,
        TargetObjectDomain: "AaltoGlobalImpact.OIP",
        TargetObjectName: "TextContent"
    };
    $.blockUI({ message: "<h3>Adding new comment...</h3>"});
    tOP.CreateObjectAjax("AaltoGlobalImpact.OIP", "Comment", saveData, function() {
        setTimeout(function () {
            ReConnectComments(parentTextContentID);
            $.unblockUI();
        }, 4000);
    }, function()
    {
        $.unblockUI();
        alert("Unexpected error in deleting comment!");
    });
    return false;
};

var runKeyPress = function (e) {
    var $newCommentField = $("#addNewCommentField");
    var parentObjectID = $newCommentField.data("ParentObjectID");
    var commentText = $newCommentField.val();
    saveNewComment(commentText, parentObjectID);
    /*alert("Your message: "+commentText+"\nParentObjectID: "+parentObjectID);*/
    return false;
    /*if (e.keyCode == 13) {
     var $newCommentField = $("#addNewCommentField");
     var parentObjectID = $newCommentField.data("ParentObjectID");
     var commentText = $newCommentField.val();
     saveNewComment(commentText, parentObjectID);
     return false;}
     return true;*/
}

var deleteComment = function () {
    var commentID = $(this).data("CommentID");
    var parentObjectID = $(this).data("ParentObjectID");
    $.blockUI({ message: "<h3>Deleting comment...</h3>"});
    tOP.DeleteIndependentObject("AaltoGlobalImpact.OIP", "Comment", commentID, function() {
        setTimeout(function () {
            ReConnectComments(parentObjectID);
            $.unblockUI();
        }, 4000);
    }, function()
    {
        $.unblockUI();
        alert("Unexpected error in deleting comment!");
    });
    return false;
};

var ReConnectComments = function (parentItemID) {
    var $commentPh = $("#viewmodalcommentareaph");
    $commentPh.empty();
    $.getJSON("../../AaltoGlobalImpact.OIP/CommentCollection/MasterCollection.json", function (allComments) {
        CommentCollection = allComments;
        var myComments = allComments.CollectionContent.filter(function (item) {
            return item.TargetObjectID === parentItemID;
        });
        if (myComments.length > 0) {
            myComments.sort(function (comment1, comment2) {
                var c1 = comment1.Created;
                var c2 = comment2.Created;
                if (c1 < c2)
                    return -1;
                if (c1 > c2)
                    return 1;
                return 0;
            });
            $commentPh.append("<div id='viewModal-allCommentsDiv'></div>");
            var $allcommentsHTML = $("#viewModal-allCommentsDiv");
            for (var i = 0; i < myComments.length; i++) {
                var currComment = myComments[i];
                var commentText = currComment.CommentText;
                var lastAuthorName = currComment.LastAuthorName;
                var created = ParseRawTimestampToDateTimeString(currComment.Created);
                //var lastModified = ParseRawTimestampToISOString(currComment.LastModified);
                var $commentLine = $("<div class='viewModal-commentContainer'><hr class='viewModal-hr'><span class='viewModal-commentAuthor-span'>" + lastAuthorName + "</span>"
                    + "<span class='viewModal-commentDate-span'>" + created + "</span><a href='#' class='viewModal-commentDelete-a'>Delete</a><br>"
                    + "<div class='viewModal-commentTextdiv'>" + commentText + "</div>"
                    + "</div>");
                var $deleteComment = $commentLine.find("a");
                $deleteComment.data("CommentID", currComment.ID);
                $deleteComment.data("ParentObjectID", parentItemID);
                $deleteComment.on("click", deleteComment);
                /*$commentPh.append($commentLine);*/
                $allcommentsHTML.append($commentLine);
            }

        }
        /*var $newCommentField = $('<input id="addNewCommentField" placeholder="Add a comment..." class="viewModal-textInputField" type="text">');*/
        var $newCommentField = $('<div class="row"><div class="large-12 columns"><div class="row collapse" id="viewModal-inputField+SendButton-div"><div class="small-10 columns"><input id="addNewCommentField" placeholder="Add a comment..." class="viewModal-textInputField" type="text"></div><div class="small-2 columns"><a href="#" id="viewModal-SendNewComment-Button" class="button secondary postfix">Send</a></div></div></div></div>');
        $commentPh.append($newCommentField);
        var $commentInputField = $("#addNewCommentField");
        $commentInputField.data("ParentObjectID", parentItemID);
        /*alert("ParentObjectID: "+parentItemID);*/
        /*$newCommentField.keypress(runKeyPress);*/
        $("#viewModal-SendNewComment-Button").on("click", runKeyPress);
    });
};

function switchActiveCanvasSection(event) {
    var triggerid = event.target.id;
    var currentactive = $(".activeSection").attr("id");

    $("#" + currentactive).removeClass("activeSection");

    if (triggerid == "addEditContentMenuAnchor") {
        $("#addEditContentSection").addClass("activeSection");
    }
    if (triggerid == "manageCategoriesMenuAnchor") {
        $("#categoriesSection").addClass("activeSection");
    }
    if (triggerid == "fileManagerMenuAnchor") {
        $("#fileManagerSection").addClass("activeSection");
    }
    if (triggerid == "dynamicContentMenuAnchor") {
        $("#dynamicContentSection").addClass("activeSection");
    }
    if (triggerid == "connectionsMenuAnchor") {
        $("#connectionsSection").addClass("activeSection");
    }
    if (triggerid == "collaboratorsMenuAnchor") {
        $("#collaboratorsSection").addClass("activeSection");
    }
    if (triggerid == "homePageEditingMenuAnchor") {
        $("#homePageEditingSection").addClass("activeSection");
    }
    if (triggerid == "researchPageEditingMenuAnchor") {
        $("#researchPageEditingSection").addClass("activeSection");
        $.getJSON('../../AaltoGlobalImpact.OIP/PagesContent/Research.json', function (contentData) {
            for (var i in contentData.CollectionContent) {
                var $caption1textarea = $("#researchPageEditingCarCaption1-textarea");
                var $caption2textarea = $("#researchPageEditingCarCaption2-textarea");
                var $nametextarea = $("#researchPageEditingContactName-input");
                var $jobtextarea = $("#researchPageEditingContactJobTitle-input");
                var $emailtextarea = $("#researchPageEditingContactEmail-input");
                var $contenttextarea = $("#researchPageEditingContent-redactortextarea");
                var currItem = contentData.CollectionContent[i];
                var caption1 = currItem.SliderCaption1;
                var caption2 = currItem.SliderCaption2;
                var name = currItem.ContactName;
                var job = currItem.ContactTitle;
                var email = currItem.ContactEmail;
                var content = currItem.Body;

                $caption1textarea.val(caption1);
                $caption2textarea.val(caption2);
                $nametextarea.val(name);
                $jobtextarea.val(job);
                $emailtextarea.val(email);

                $('#researchPageEditingContent-textareaDIV').empty();
                var textareaResearch = $("<textarea id='researchPageEditingContent-redactortextarea' style='height: 300px;'>");
                $('#researchPageEditingContent-textareaDIV').append(textareaResearch);
                $('#researchPageEditingContent-redactortextarea').val(content);
                $('#researchPageEditingContent-redactortextarea').redactor(
                    {   minHeight: 300,
                        maxHeight: 350,
                        autoresize: false,
                        buttons: ['bold', 'italic', 'alignment', 'unorderedlist', 'orderedlist', 'image', 'video', "link"]
                    });
            }
        })
    }
    if (triggerid == "businessPageEditingMenuAnchor") {
        $("#businessPageEditingSection").addClass("activeSection");
    }
    if (triggerid == "innovationsPageEditingMenuAnchor") {
        $("#innovationsPageEditingSection").addClass("activeSection");
    }
    if (triggerid == "groupMembersMenuAnchor") {
        $("#groupMembersSection").addClass("activeSection");
    }
    if (triggerid == "groupInfoMenuAnchor") {
        $("#groupSection").addClass("activeSection");
    }
    if (triggerid=="timelineMenuAnchor")
    {
        $("#timelineSection").addClass("activeSection");
        $("#my-timeline").empty();
        $.getJSON('../../AaltoGlobalImpact.OIP/TextContentCollection/MasterCollection.json', function(contentData) {
            /*var wholeTimelineData=new Array();*/
            var wholeTimelineData={
                "timeline":
                {
                    "headline":"Headline",
                    "type":"default",
                    "text":"Welcome to the timeline view",
                    "startDate":"2014,1,1",
                    "date":[]
                }
            };
            for (var i in contentData.CollectionContent) {
                var currentObject=contentData.CollectionContent[i];
                var currentID=currentObject.ID;
                var currentTitle=currentObject.Title ? currentObject.Title : "";
                var currentMainCategory;
                var currentExcerpt=currentObject.Excerpt;
                var currentAuthor=currentObject.Author;
                var currentPublishedDate=ParseRawTimestampToDateString(currentObject.Published);
                var imageSizeString="256";
                var dateSubString=currentPublishedDate.split(".");
                var timelineFormatedStartDate= dateSubString[2]+","+dateSubString[1]+","+dateSubString[0];
                var endDay=dateSubString[0]+1;
                var timelineFormatedEndDate= dateSubString[2]+","+dateSubString[1]+","+endDay;
                var currentImagePath=currentObject.ImageData
                    ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
                    : null;
                if(!currentObject.Categories|| !currentObject.Categories.CollectionContent || !currentObject.Categories.CollectionContent.length)
                    currentMainCategory="NEWS";
                else currentMainCategory=currentObject.Categories.CollectionContent[0].Title;
                //-----------------------------begins:Here we get the total number of comments for each update
                var numberOfComments=0;
                //-----------------------------ends:Here we get the total number of comments for each update
                /*var myTimelineData={
                 "startDate":timelineFormatedStartDate,
                 "headline":currentTitle,
                 "text":currentExcerpt,
                 "tag":currentMainCategory,
                 "asset":
                 {
                 "media":currentImagePath,
                 "credit":currentAuthor,
                 "caption":currentTitle
                 }};*/
                var myTimelineData={
                    "startDate":timelineFormatedStartDate,
                    "headline":currentTitle,
                    "text":currentExcerpt,
                    "tag":currentMainCategory,
                    "asset":
                    {
                        "media":currentImagePath,
                        "thumbnail":currentImagePath,
                        "credit":currentAuthor,
                        "caption":currentTitle
                    }

                };

                wholeTimelineData.timeline.date.push(myTimelineData);
            }//ends for loop
            createStoryJS({ type:'timeline',width:'100%',height:'600',source:wholeTimelineData,embed_id:'my-timeline'});
        })//closes getJSON

    }//if (triggerid=="timelineSection")
}

function editContent_PopulateModal(editEvent) {
    var clickedEditID = editEvent.target.id.replace("editContentButton-dataID-", '');
    $.getJSON('../../AaltoGlobalImpact.OIP/TextContent/' + clickedEditID + ".json", function (contentData) {
        tDCM.SetObjectInStorage(contentData);
        var queryValue = "";
        var currentObject = contentData;
        var currentID = currentObject.ID;
        var currentETag = currentObject.MasterETag;
        var currentTitle = currentObject.Title;
        var currentExcerpt = currentObject.Excerpt;
        var currentAuthor = currentObject.Author;
        var currentPublishedDate = ParseRawTimestampToISOString(currentObject.Published);

        // Image support content initiation
        var imageSizeString = "256";
        var currentImagePath = currentObject.ImageData
            ? "../../AaltoGlobalImpact.OIP/MediaContent/" + currentObject.ImageData.ID + "_" + imageSizeString + "x" + imageSizeString + "_crop" + currentObject.ImageData.AdditionalFormatFileExt
            : null;
        // Initiate binary file elements for image
        $("#editContentModal-ImageData").attr("data-oipfile-filegroupid", "editModal");
        tOP.InitiateBinaryFileElements("editContentModal-ImageData", currentID, "ImageData", currentImagePath);


        if (currentObject.RawHtmlContent) {
            currentObject.BodyRendered = currentObject.RawHtmlContent;
        } else if (currentObject.Body) {
            markdown = new MarkdownDeep.Markdown();
            markdown.SafeMode = true;
            currentObject.BodyRendered = markdown.Transform(currentObject.Body);
        } else
            currentObject.BodyRendered = "";

        var currentArticleBody = currentObject.BodyRendered;
        // Kalle's contemplate fix to Hugo's raw management =>
        // the raw html is at BodyRendered as is, the current markdown rendering is as well now
        // previous problem: if there was markdown-entered data in the article it wasn't working in rawhtml
        var rawbody = currentArticleBody;

        var currentMainCategory = "News";


        queryValue = currentID;
        $('#editContentModal-id').val(queryValue);
        queryValue = currentETag;
        $('#editContentModal-etag').val(queryValue);
        $('#editContentModal-title').val(currentTitle);
        $('#editContentModal-published').val(currentPublishedDate);
        $('#editContentModal-excerpt').val(currentExcerpt);

        /*getAndPopulate_Isotope_Filter_Categories ();*/
        getAndPopulateCategoryOptions();

        //check if the "field" Author exists in the JSON file
        /*queryValue=contentData.content[i].Author;*/
        if (currentAuthor == false || currentAuthor === null || currentAuthor === "undefined" || currentAuthor === undefined)
            queryValue = "Empty";
        else
            queryValue = currentAuthor;

        $('#editContentModal-author').val(queryValue);

        //suggested Content rendering by Kalle:  queryValue=currentArticleBody;
        //My suggestion: cleaning the "old" articles with markdown and extra styling
        rawbody = rawbody.replace(new RegExp("div", "g"), 'p');
        rawbody = rawbody.replace(new RegExp("<span>", "g"), '');
        rawbody = rawbody.replace(new RegExp("</span>", "g"), '');
        var currentArticleBodyVHugo = $.htmlClean(rawbody, {format: true});
        //ends cleaning the "old" articles with markdown and extra styling
        $('#editTextareaDivHolder').empty();
        var textarea = $("<textarea id='editContentModal-content' style='min-height: 300px;'>");
        $('#editTextareaDivHolder').append(textarea);
        $('#editContentModal-content').val(currentArticleBodyVHugo);
        $('#editContentModal-content').redactor(
            {   minHeight: 300,
                maxHeight: 350,
                autoresize: false,
                buttons: ['bold', 'italic', 'alignment', 'unorderedlist', 'orderedlist', 'image', 'video', "link"]
            });

        queryValue = currentImagePath;
        $('#editContentModal-imagePath').val(queryValue);

        //send the correspondent image to the placeholder, but clean its containing div first
        $("#editContentModal-image").empty(); //clean the image Placeholder in the form
        queryValue = "<img src='" + currentImagePath + "' style='width:auto;height:auto;max-height:300px;margin-left:auto;margin-right:auto;'>";
        $("#editContentModal-image").append(queryValue);
        $('#editContentModal').foundation('reveal', 'open');
    }); //ends getJson
}//ends function editContent

//--begins: Function get_content
//--ends function get_content();
function get_files() {
    $("#fileTableDivContainer").empty();
    $('#form-addNewfile-fileUpload').ajaxForm();//initializes the FILE Upload Form
    return $.getJSON('json/files.json', function (contentData) {
        var file_table = "";
        file_table += "<table style='table-layout:fixed;width:100%;'><thead><tr><th style='width:20%;max-width: 130px;'>Preview</th><th class='breakwords'>URL</th><th>Description</th><th>Uploaded</th></tr></thead><tbody>";
        for (var i in contentData.fileRepository) {
            //noinspection JSUnfilteredForInLoop
            if ((contentData.fileRepository[i].extension == "jpg") ||
                (contentData.fileRepository[i].extension == "jpeg") ||
                (contentData.fileRepository[i].extension == "png") ||
                (contentData.fileRepository[i].extension == "tiff") ||
                (contentData.fileRepository[i].extension == "gif")) {
                file_table += "<tr><td style='width:20%;max-width: 130px;'><div style='width: 100%;'><img src='" + contentData.fileRepository[i].local_path + "' style='max-width:120px;width:100%;height:auto;'></div></td>";
            }
            else
                file_table += "<tr><td class='breakwords' style='width:20%;max-width: 130px;'><a href='" + contentData.fileRepository[i].URL + "' style='font-size: 150%;' target='_blank'>" + contentData.fileRepository[i].extension + "</a></td>";

            file_table += "<td class='breakwords' style='width:150px;vertical-align: top;'>" + contentData.fileRepository[i].URL + "</td>";
            file_table += "<td style='vertical-align: top;'>" + contentData.fileRepository[i].description + "</td>";
            file_table += "<td style='vertical-align: top;'>" + contentData.fileRepository[i].upload_date + "</td></tr>";
        }//ends for loop
        file_table += "</tbody></table>";
        $("#fileTableDivContainer").append(file_table);
        $(".breakwords").css('word-wrap', 'break-word');
    })
}

function filter_isotope_items() {
    $('.portfolioFilter .current').removeClass('current');
    $(this).addClass('current');
    var $container = $("#contentDivContainer");
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
    console.log("Entered 'filter_isotope_items' Function alright.");
}

function triggerToolTipUploadPhoto() {
    $("#tooltip-choosePhotoHere").trigger("mouseout");
    $("#tooltip-uploadphoto").trigger("mouseover");
}

function submit_contentDelete_confirm() {
    var objectID = $("#alert-contentDelete-confirm-ID").data("DeleteID");
    tOP.DeleteIndependentObject("AaltoGlobalImpact.OIP", "TextContent", objectID);
    setTimeout(function () {
        $('#alert-contentDelete-confirm').foundation('reveal', 'close');
        location.reload();
        return false;
    }, 3000);
}

function close_contentDelete_confirm() {
    $('#alert-contentDelete-confirm').foundation('reveal', 'close');
}
