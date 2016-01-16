/**
 * Created by kalle on 10.2.2014.
 */

/// <reference path="jquery.d.ts" />
/// <reference path="DataConnectionManager.ts" />

module TheBall.Interface.UI {
    export class BinaryFileItem {
        constructor(public inputElement:HTMLInputElement, public file:any, public content:string) {

        }

        IsSet() : boolean {
            if(this.inputElement.name)
                return true;
            return false;
        }

        GetPropertyName() : string {
            //var $inputElement = $(this.inputElement);
            //var propName = $inputElement.attr("data-oipfile-propertyname");
            var propName = this.inputElement.name;
            return propName;
        }

        GetEmbeddedPropertyContent() : string {
            if(!this.file || !this.file.name || !this.content)
                return null;
            return this.file.name + ":" + this.content;
        }
    }
    export class OperationManager {
        private $submitForm;
        private DCM:DataConnectionManager;
        private BinaryFileSelectorBase:string;
        constructor(dcm:DataConnectionManager, binaryFileSelectorBase:string) {
            if(!dcm)
                dcm = new TheBall.Interface.UI.DataConnectionManager();
            if(!binaryFileSelectorBase)
                binaryFileSelectorBase = ".oipfile";
            this.DCM = dcm;
            this.BinaryFileSelectorBase = binaryFileSelectorBase;
            var $body = $("body");
            var formHtml = "<form style='margin:0px;width:0px;height:0px;background-color: transparent;border: 0px none transparent;padding: 0px;overflow: hidden;visibility:hidden'  enctype='multipart/form-data' id='OperationManager_DynamicIFrameForm' " +
                "method='post' target='OperationManager_IFrame'></form> ";
            var iFrameHtml = "<iframe style='margin:0px;width:0px;height:0px;background-color: transparent;border: 0px none transparent;padding: 0px;overflow: hidden;visibility: hidden' name='OperationManager_IFrame' src='about:blank'></iframe>";
            $body.append(formHtml);
            $body.append(iFrameHtml);
            this.$submitForm = $("#OperationManager_DynamicIFrameForm");

            if (typeof String.prototype["startsWith"] != 'function') {
                // see below for better implementation!
                String.prototype["startsWith"] = function (str){
                    return this.lastIndexOf(str, 0) === 0;
                };
            }
        }

        getHiddenInput = function (key:string, dataContent) {
            var dataValue = dataContent != null ? dataContent.toString() : "";
            var $input = $('<input type="hidden">').attr('name', key).val(dataValue);
            return $input;
        };

        SaveIndependentObject(objectID:string, objectRelativeLocation:string, objectETag:string, objectData:any, successCallback?:any, failureCallback?:any,
            keyNameResolver?:any)
        {
            var $form = this.$submitForm;
            $form.empty();
            var id = objectID;
            var contentSourceInfo = objectRelativeLocation + ":" + objectETag;
            $form.append(this.getHiddenInput("ContentSourceInfo", contentSourceInfo));
            $form.append(this.getHiddenInput("NORELOAD", ""));
            var realKey;
            for(var key in objectData) {
                if(key.startsWith("File_"))
                    realKey = key.replace("File_", "File_" + id + "_");
                else if(key.startsWith("Object_"))
                    realKey = key.replace("Object_", "Object_" + id + "_");
                else if(key.startsWith("FileEmbedded_"))
                    realKey = key.replace("FileEmbedded_", "FileEmbedded_" + id + "_");
                else
                    realKey = id + "_" + key;
                if(keyNameResolver)
                    realKey = keyNameResolver(realKey);
                var $hiddenInput = this.getHiddenInput(realKey, objectData[key]);
                $form.append($hiddenInput);
            }
            //$form.submit();
            if(!failureCallback)
                failureCallback = function() {};
            var userFailure = failureCallback;
            var userSuccess = function(responseData) {
                if(successCallback)
                    successCallback(responseData);
            };
            var me = this;
            $.ajax({
                type: "POST",
                data: $form.serialize(),
            }).done(response => { me.AjaxPollingOperation(response, userSuccess, userFailure) }).fail(userFailure);
            $form.empty();
        }

        AjaxPollingOperation(response:any, userSuccess:any, userFailure:any)
        {
            var totalSecs = 0;
            var operationID = response.OperationID;
            var opPollUrl = "../../TheBall.Interface/InterfaceOperation/" + operationID + ".json";
            var pollFunc = (retryFunc, finishFunc) => {
                $.ajax(opPollUrl).done(response => {
                    if(response && response.ErrorMessage) {
                        console.log("OP Error: " + totalSecs);
                        var errorObject = {
                            ErrorCode: response.ErrorCode,
                            ErrorMessage: response.ErrorMessage
                        };
                        userFailure(errorObject)
                    } else {
                        console.log("OP Retrying in 1 sec... total count: " + totalSecs);
                        totalSecs++;
                        setTimeout(() => { retryFunc(retryFunc, finishFunc); }, 1000);
                    }
                }).fail(finishFunc);
            };
            pollFunc(pollFunc, userSuccess);
        }

        SaveObject(objectID:string, objectETag:string, dataContents:any) {
            var obj = this.DCM.TrackedObjectStorage[objectID];
            if(!obj)
                throw "Object not found with ID: " + objectID;
            if(obj.MasterETag != objectETag)
                throw "Object ETag mismatch on save: " + objectID;
            this.SaveIndependentObject(obj.ID, obj.RelativeLocation, obj.MasterETag, dataContents);
        }

        DeleteIndependentObject(domainName:string, objectName:string, objectID:string, successCallback?:any, failureCallback?:any)
        {
            var $form = this.$submitForm;
            $form.empty();
            $form.append(this.getHiddenInput("ObjectDomainName", domainName));
            $form.append(this.getHiddenInput("ObjectName", objectName));
            $form.append(this.getHiddenInput("ObjectID", objectID));
            $form.append(this.getHiddenInput("ExecuteOperation", "DeleteSpecifiedInformationObject"));
            $form.append(this.getHiddenInput("NORELOAD", ""));
            //$form.submit();
            if(!failureCallback)
                failureCallback = function() {};
            var userFailure = failureCallback;
            var userSuccess = function(responseData) {
                if(successCallback)
                    successCallback(responseData);
            };
            var me = this;
            $.ajax({
                type: "POST",
                data: $form.serialize(),
            }).done(response => { me.AjaxPollingOperation(response, userSuccess, userFailure) }).fail(userFailure);
            $form.empty();
        }

        DeleteObject(objectID:string) {
            var obj = this.DCM.TrackedObjectStorage[objectID];
            if(!obj)
                throw "Object not found with ID: " + objectID;
            var contentSourceInfo = obj.RelativeLocation + ":" + obj.MasterETag;
            var objectID = obj.ID;
            var domainName = obj.SemanticDomainName;
            var objectName = obj.Name;
            this.DeleteIndependentObject(domainName, objectName, objectID);
        }

        CreateObjectAjax(domainName:string, objectName:string, dataContents:any, successCallback?:any, failureCallback?:any) {
            var $form = this.$submitForm;
            $form.empty();
            $form.append(this.getHiddenInput("ObjectDomainName", domainName));
            $form.append(this.getHiddenInput("ObjectName", objectName));
            $form.append(this.getHiddenInput("ExecuteOperation", "CreateSpecifiedInformationObjectWithValues"));
            $form.append(this.getHiddenInput("NORELOAD", ""));
            for(var key in dataContents) {
                var $hiddenInput = this.getHiddenInput(key, dataContents[key]);
                $form.append($hiddenInput);
            }
            //$form.submit();
            if(!failureCallback)
                failureCallback = function() {};
            var userFailure = failureCallback;
            var userSuccess = function(responseData) {
                if(successCallback)
                    successCallback(responseData);
            };
            var me = this;
            $.ajax({
                type: "POST",
                data: $form.serialize(),
            }).done(response => { me.AjaxPollingOperation(response, userSuccess, userFailure) }).fail(userFailure);
            $form.empty();
        }

        ExecuteOperationWithForm(operationName:string, operationParameters:any, successCallback?:any, failureCallback?:any) {
            var $form = this.$submitForm;
            $form.empty();
            $form.append(this.getHiddenInput("ExecuteOperation", operationName));
            for(var key in operationParameters) {
                var $hiddenInput = this.getHiddenInput(key, operationParameters[key]);
                $form.append($hiddenInput);
            }
            $form.append(this.getHiddenInput("NORELOAD", ""));
            //$form.submit();
            if(!failureCallback)
                failureCallback = function() {};
            var userFailure = failureCallback;
            var userSuccess = function(responseData) {
                if(successCallback)
                    successCallback(responseData);
            };
            var me = this;
            $.ajax({
                type: "POST",
                data: $form.serialize(),
            }).done(response => { me.AjaxPollingOperation(response, userSuccess, userFailure) }).fail(userFailure);
            $form.empty();
        }
        ExecuteOperationWithAjax(operationFullName:string, contentObject:any, successCallback?:any, failureCallback?:any) {
            var jsonData = JSON.stringify(contentObject);
            if(!failureCallback)
                failureCallback = function() {};
            var userFailure = failureCallback;
            var userSuccess = function(responseData) {
                if(successCallback)
                    successCallback(responseData);
            };
            var me = this;
            $.ajax(
                { type: "POST",
                    url: "?operation=" + operationFullName,
                    contentType: "application/json",
                    data: jsonData,
                }
            ).done(response => { me.AjaxPollingOperation(response, userSuccess, userFailure) }).fail(userFailure);
        }

        setButtonMode($button, mode) {
            var buttonText = mode == "add" ? "Add Image" : "Remove Image";
            $button.attr('data-mode', mode);
            $button.html(buttonText);
        }

        reset_field(e) {
            e.wrap('<form>').parent('form').trigger('reset');
            e.unwrap();
        }

        setImageValues($file, $hidden, fileFieldName) {
            //$hidden.attr('name', '');
            $hidden.removeAttr('name');
            $file.attr('name', fileFieldName);
        }

        clearImageValue($file, $hidden, fileFieldName) {
            $hidden.attr('name', fileFieldName);
            //$file.attr('name', '');
            $file.removeAttr('name');
        }

        setSelectFileButtonEvents($selectButton, $fileInput) {
            $selectButton.off("click.oip").on("click.oip", function()
            {
                $fileInput.click();
            });
        }

        setRemoveFileButtonEvents($removeButton, $fileInput, $hiddenInput, $imagePreview) {
            var me = this;
            $removeButton.off("click.oip").on("click.oip", function() {
                var fileFieldName:string = $fileInput.attr("data-oipfile-propertyname");
                me.reset_field($fileInput);
                me.setPreviewImageSrc($imagePreview, null);
                me.clearImageValue($fileInput, $hiddenInput, fileFieldName);
            });
        }

        setPreviewImageSrc($imagePreview, srcContent:string) {
            if(!srcContent) {
                var noImageUrl = $imagePreview.attr("data-oipfile-noimageurl");
                if(!noImageUrl) {
                    $imagePreview.hide();
                }
                $imagePreview.attr('src', noImageUrl);
            } else {
                console.log("Existing src: " + $imagePreview.attr('src'));
                console.log("Changing-to src: " + srcContent);
                $imagePreview.attr('src', srcContent);
                console.log("New src: " + $imagePreview.attr('src'));
                $imagePreview.show();
            }
        }

        setFileInputEvents($fileInput, $hiddenInput, $imagePreview) {
            var me = this;
            var fileFieldName:string = $fileInput.attr("data-oipfile-propertyname");
            var changeEventName = "change.oip";
            $fileInput.off(changeEventName).on(changeEventName, function() {
                var input:HTMLInputElement = <HTMLInputElement>this;
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e:any) {
                        me.setPreviewImageSrc($imagePreview, e.target.result);
                        me.setImageValues($fileInput, $hiddenInput, fileFieldName);
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            });
        }

        InitiateBinaryFileElementsAroundInput($fileInput:JQuery, objectID:string, propertyName:string, initialPreviewUrl:string, noImageUrl:string, currentGroupID:string) {
            var jQueryClassSelector:string = this.BinaryFileSelectorBase;
            var inputFileSelector = "input" + jQueryClassSelector + "[type='file']";
            //var hiddenInputSelector = "input" + jQueryClassSelector + "[type='hidden']";
            //var previewImgSelector = "img" + jQueryClassSelector;
            var inputFileWithNameSelector = inputFileSelector + "[name]";
            //var hiddenInputWithNameSelector = hiddenInputSelector + "[name]";
            var dataAttrPrefix = "data-";
            var fileGroupIDDataName = "oipfile-filegroupid";
            var objectIDDataName = "oipfile-objectid";
            var propertyDataName = "oipfile-propertyname";
            var buttonTypeDataName = "oipfile-buttontype";
            var buttonTypeSelect = "select";
            var buttonTypeRemove = "remove";
            var imgPreviewNoImageUrlDataName = "oipfile-noimageurl";

            if($fileInput.length === 0) { // If empty entry set, we need to find existing with given terms
                $fileInput = $("input.oipfile-rootitem[" + dataAttrPrefix + fileGroupIDDataName + "='" + currentGroupID + "']");
                if($fileInput.length === 0)
                    throw "Cannot find existing $fileInput for group: " + currentGroupID;
            } else {
                $fileInput.addClass("oipfile-rootitem");
                $fileInput.attr(dataAttrPrefix + fileGroupIDDataName, currentGroupID);
            }

            $fileInput.addClass("oipfile");
            $fileInput.hide();
            $fileInput.width(0);
            $fileInput.height(0);
            $fileInput.attr(dataAttrPrefix + propertyDataName, propertyName);
            $fileInput.attr(dataAttrPrefix + objectIDDataName, objectID);
            $fileInput.removeAttr("name");
            this.reset_field($fileInput);
            //var currentGroupID = $fileInput.attr(dataAttrPrefix + fileGroupIDDataName);
            var currentGroupDataSelectorString =
                "[data-" + fileGroupIDDataName + "='" + currentGroupID + "']";

            var previewImgSelector = "img.oipfile" + currentGroupDataSelectorString;
            var $previevImg = $(previewImgSelector);
            if($previevImg.length === 0) {
                $previevImg = $("<img class='oipfile' />")
                $previevImg.attr(dataAttrPrefix + fileGroupIDDataName, currentGroupID);
                if(!noImageUrl)
                    noImageUrl = "";
                $previevImg.attr(dataAttrPrefix + imgPreviewNoImageUrlDataName, noImageUrl);
                $previevImg.insertBefore($fileInput);
            }
            console.log("Trying to set preview url as: " + initialPreviewUrl);
            this.setPreviewImageSrc($previevImg, initialPreviewUrl);
            var hiddenInputSelector = "input.oipfile[type='hidden']" + currentGroupDataSelectorString;
            var $hiddenInput = $(hiddenInputSelector);
            if($hiddenInput.length === 0) {
                $hiddenInput = $("<input class='oipfile' type='hidden'>");
                $hiddenInput.attr(dataAttrPrefix + fileGroupIDDataName, currentGroupID);
                $hiddenInput.insertBefore($fileInput);
            }
            $hiddenInput.removeAttr("name");

            this.setFileInputEvents($fileInput, $hiddenInput, $previevImg);

            var selectButtonSelector = ".oipfile"
                + currentGroupDataSelectorString
                + "[data-" + buttonTypeDataName + "='" + buttonTypeSelect + "']";
            var $selectButton = $(selectButtonSelector);
            if($selectButton.length === 0) {
                // Create select button
                $selectButton = $("<a class='button small oipfile'>Select</a>");
                $selectButton.attr(dataAttrPrefix + fileGroupIDDataName, currentGroupID);
                $selectButton.attr(dataAttrPrefix + buttonTypeDataName, buttonTypeSelect);
                $selectButton.insertAfter($fileInput);
            }
            this.setSelectFileButtonEvents($selectButton, $fileInput);
            var removeButtonSelector = ".oipfile"
                + currentGroupDataSelectorString
                + "[data-" + buttonTypeDataName + "='" + buttonTypeRemove + "']";
            var $removeButton = $(removeButtonSelector);
            if($removeButton.length === 0) {
                // Create remove button
                $removeButton = $("<a class='button small oipfile'>Remove</a>");
                $removeButton.attr(dataAttrPrefix + fileGroupIDDataName, currentGroupID);
                $removeButton.attr(dataAttrPrefix + buttonTypeDataName, buttonTypeRemove);
                $removeButton.insertAfter($selectButton);
            }
            this.setRemoveFileButtonEvents($removeButton, $fileInput, $hiddenInput, $previevImg);
        }

        InitiateBinaryFileElements(fileInputID:string, objectID:string, propertyName:string, initialPreviewUrl:string, noImageUrl:string) {
            var $fileInput = $("#" + fileInputID);
            var dataAttrPrefix = "data-";
            var fileGroupIDDataName = "oipfile-filegroupid";
            var currentGroupID = $fileInput.attr(dataAttrPrefix + fileGroupIDDataName);
            this.InitiateBinaryFileElementsAroundInput($fileInput, objectID, propertyName, initialPreviewUrl, noImageUrl, currentGroupID);
        }

        readFileFromInputAsync(fileInput:HTMLInputElement) : JQueryPromise<any> {
            if (fileInput.files && fileInput.files[0]) {
                var file = fileInput.files[0];
                return this.readFileAsync(fileInput, file);
            }
            var emptyDeferred = $.Deferred();
            emptyDeferred.resolve(new BinaryFileItem(fileInput, null, null));
            return emptyDeferred.promise();
        }

        readFileAsync(fileInput:HTMLInputElement, file) {
            var reader = new FileReader();
            var deferred = $.Deferred();

            reader.onload = function(event:any) {
                deferred.resolve(new BinaryFileItem(fileInput, file, event.target.result));
            };

            reader.onerror = function() {
                deferred.reject(this);
            };
            reader.readAsDataURL(file);
            return deferred.promise();
        }

        AppendBinaryFileValuesToData(objectID:string, data:any, callBack: () => void)      {
            this.PrepareBinaryFileContents(objectID, function(binaryFileItems) {
                var imageFieldName;
                var editedModalImage;
                for(var i = 0; i < binaryFileItems.length; i++) {
                    var item = binaryFileItems[i];
                    var propertyName = item.GetPropertyName();
                    if(item.IsSet() && propertyName) {
                        editedModalImage = item.GetEmbeddedPropertyContent();
                        imageFieldName = "FileEmbedded_" + propertyName;
                        data[imageFieldName] = editedModalImage;
                    }
                }
                callBack();
            });
        }


        PrepareBinaryFileContents(objectID:string, callBack: (fileItems:BinaryFileItem[]) => void) {
            var me = this;
            var jQueryClassSelector:string = this.BinaryFileSelectorBase;
            var inputFileSelector = "input.oipfile"
                + "[type='file'][data-oipfile-objectid='" + objectID + "' ]";

            var inputFileWithNameSelector = inputFileSelector + "[name]";
            var inputFileWithoutNameSelector = inputFileSelector + ":not([name])";
            var hiddenInputSelector = "input.oipfile[type='hidden']";
            var hiddenInputWithNameSelector = hiddenInputSelector + "[name]";

            var $hiddenInputsWithName = $();
            var $inputFilesWithoutName = $(inputFileWithoutNameSelector);
            $inputFilesWithoutName.each(function(index, element) {
                var currentGroupID = $(this).attr("data-oipfile-filegroupid");
                var relativeHiddenWithNameSelector = hiddenInputWithNameSelector
                    + "[data-oipfile-filegroupid='" + currentGroupID + "']";
                var $relativeHiddenWithName = $(relativeHiddenWithNameSelector);
                $hiddenInputsWithName = $hiddenInputsWithName.add($relativeHiddenWithName);
            });


            var $filesToAdd = $(inputFileWithNameSelector);
            var $fileReadingPromises = $filesToAdd.map(function(index, element) {
                var inputElement:HTMLInputElement = <HTMLInputElement> element;
                return me.readFileFromInputAsync(inputElement);
            });
            var $filesToRemove = $hiddenInputsWithName;
            var $fileRemoveData = $filesToRemove.map(function(index, element) {
                var inputElement:HTMLInputElement = <HTMLInputElement> element;
                return new BinaryFileItem(inputElement, null, null);
            });
            var concatCallbackArray = $fileReadingPromises.add($fileRemoveData);
            $.when.apply($, concatCallbackArray).then(function() {
                var args:BinaryFileItem[]=<BinaryFileItem[]><any>arguments;
                callBack(args);
            });
        }
        /*
         <input id="ObjectDelete_ExecuteOperation" name="ExecuteOperation"
         value="DeleteSpecifiedInformationObject" type="hidden" />
         <input id="ObjectDelete_ObjectDomainName" name="ObjectDomainName"
         value="" type="hidden" />
         <input id="ObjectDelete_ObjectName" name="ObjectName"
         value="" type="hidden" />
         <input id="ObjectDelete_ObjectID" name="ObjectID"
         value="" type="hidden" />




         */
    }
}
