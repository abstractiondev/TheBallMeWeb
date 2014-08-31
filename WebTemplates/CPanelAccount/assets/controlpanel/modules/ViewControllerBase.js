/**
* Created by kalle on 31.5.2014.
*/
define(["require", "exports"], function(require, exports) {
    var ViewControllerBase = (function () {
        function ViewControllerBase(divID, currOPM, currUDG) {
            this.divID = divID;
            this.currOPM = currOPM;
            this.currUDG = currUDG;
        }
        ViewControllerBase.prototype.getClassConstructor = function (obj) {
            //return obj.__proto__.constructor.name;
            //return obj.__proto__.constructor;
            return obj.constructor;
        };

        ViewControllerBase.prototype.Initialize = function (dataUrl) {
            this.dataUrl = dataUrl;
            var $hostDiv = $("#" + this.divID);
            $hostDiv.addClass("oip-controller-root");
            $hostDiv.data("oip-controller", this);
            var me = this;
            me.$initialDeferred = $.Deferred();
            me.$initialized = me.$initialDeferred.promise();

            // FOR SOME REASON - the $hostDiv element IS NOT covering all events within, for example a modal...
            //$hostDiv.on("click", ".oip-controller-command", function(event) {
            // ... and FOR SOME OTHER REASON - the below (which narrows it down to this #div and its children)...
            // ... FAILS TO FIRE on the modal again... => so we're back at direct div + class filter
            //$(document).on("click", "#" + this.divID + " .oip-controller-command", function(event) {
            // The reason found - foundation MOVES the modal on reveal elsewhere on the element tree...
            $hostDiv.off("click");
            $hostDiv.on("click", ".oip-controller-command", function (event) {
                me.handleEvent($(this), "click", event);
            });
            me.ControllerInitialize();
            $.when(me.DoneInitializedPromise()).then(function () {
                var $me = $hostDiv;
                $me.foundation();
                var wnd = window;
                $me.find(".oip-modalbutton").on("click", wnd.ControllerCommon.ModalButtonClick);
                me.$myModals = $me.find(".oip-controller-modal");
                me.$myModals.data("oip-controller-instance", me);
            });
        };

        ViewControllerBase.prototype.DoneInitializedPromise = function () {
            return this.$initialized;
        };

        ViewControllerBase.prototype.CommonWaitForOperation = function (waitingText) {
            var jq = $;
            jq.blockUI({ message: "<h3>" + waitingText + "</h3>" });
        };

        ViewControllerBase.prototype.CommonErrorHandler = function (jqXhr, textStatus, errorThrown) {
            var errorObject = JSON.parse(jqXhr.responseText);
            var wnd = window;
            wnd.DisplayErrorDialog("Error", errorObject.ErrorType, errorObject.ErrorText);
        };

        ViewControllerBase.prototype.CommonSuccessHandler = function () {
            var jq = $;
            jq.unblockUI();
        };

        ViewControllerBase.prototype.ControllerInitialize = function () {
            throw "ControllerInitialize not implemented";
        };

        ViewControllerBase.prototype.ControllerInitializeDone = function () {
            this.$initialDeferred.resolve();
        };

        ViewControllerBase.prototype.ReInitialize = function () {
            if (this.$myModals.length > 0) {
                this.$myModals.remove();
            }

            //var $hostDiv = $("#" + this.divID);
            var constructor = this.getClassConstructor(this);
            var vc = new constructor(this.divID, this.currOPM, this.currUDG);
            vc.Initialize(this.dataUrl);
            vc.VisibleTemplateRender();
        };

        ViewControllerBase.prototype.ExecuteCommand = function (commandName) {
            var commandFunction = this[commandName];
            if (_.isFunction(commandFunction)) {
                commandFunction.call(this);
            } else
                throw "Command implementing function not found: " + commandName;
        };

        ViewControllerBase.prototype.ExecuteOperation = function (operationDomain, operationName, parameters) {
            var callBackName = operationName + "Callback";
            var callBack = this[callBackName];
            if (!_.isFunction(callBack)) {
                callBack = null;
            } else {
                callBack = function () {
                    callBack.call(this);
                };
            }

            //this.currOPM.ExecuteOperationWithAjax(operationName, parameters, callBack);
            this.currOPM.ExecuteOperationWithForm(operationName, parameters, callBack);
        };

        ViewControllerBase.prototype.getObjectByID = function (collection, id) {
            for (var i = 0; i < collection.length; i++) {
                var currObj = collection[i];
                if (currObj.ID === id)
                    return currObj;
            }
            return null;
        };

        ViewControllerBase.prototype.VisibleTemplateRender = function () {
            throw "VisibleTemplateRender not implemented";
        };

        ViewControllerBase.prototype.InvisibleTemplateRender = function () {
            throw "InvisibleTemplateRender not implemented";
        };

        ViewControllerBase.prototype.handleEvent = function ($source, eventName, eventData) {
            var commandName = $source.data("oip-command");
            var commandFunction = this[commandName];
            if (!_.isFunction(commandFunction))
                throw "Controller's command function not implemented: " + commandName + " on hostind div: " + this.divID;
            ;
            commandFunction.call(this, $source, eventName, eventData);
        };

        ViewControllerBase.prototype.handleModalEvent = function ($modal, $source, eventName, eventData) {
            var commandName = "Modal_" + $source.data("oip-command");
            var commandFunction = this[commandName];
            if (!_.isFunction(commandFunction))
                throw "Controller's command function not implemented: " + commandName + " on hostind div: " + this.divID;
            ;
            commandFunction.call(this, $modal, $source);
        };

        ViewControllerBase.prototype.Modal_Common_CloseOpenModal = function ($modal, $source) {
            $modal.foundation('reveal', 'close');
        };

        ViewControllerBase.prototype.$getSelectedFieldWithinModal = function ($modal, selector) {
            return $modal.find(selector);
        };

        ViewControllerBase.prototype.$getNamedFieldWithinModal = function ($modal, controlName) {
            return $modal.find("[name='" + controlName + "']");
        };

        ViewControllerBase.prototype.$getSelectedFieldsWithin = function (selector) {
            var $hostDiv = $("#" + this.divID);
            return $hostDiv.find(selector);
        };

        ViewControllerBase.prototype.$getNamedFieldWithin = function (controlName) {
            var $hostDiv = $("#" + this.divID);
            return $hostDiv.find("[name='" + controlName + "']");
        };
        return ViewControllerBase;
    })();

    
    return ViewControllerBase;
});
