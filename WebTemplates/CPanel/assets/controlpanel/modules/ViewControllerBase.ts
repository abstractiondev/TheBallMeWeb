/**
 * Created by kalle on 31.5.2014.
 */

/// <reference path="../../oiplib1.0/TheBall.Interface.UI/OperationManager.ts" />
/// <reference path="../../oiplib1.0/TheBall.Interface.UI/UpdatingDataGetter.ts" />
/// <reference path="lodash.d.ts" />


import IViewController = require("IViewController");

class ViewControllerBase implements IViewController{

    public dataUrl:string;
    $initialized:JQueryPromise<any>;
    $initialDeferred:JQueryDeferred<any>;
    $myModals:JQuery;

    getClassConstructor(obj):any {
        //return obj.__proto__.constructor.name;
        //return obj.__proto__.constructor;
        return obj.constructor;
    }

    public Initialize(dataUrl:string) {
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
        $hostDiv.on("click", ".oip-controller-command", function(event) {
            me.handleEvent($(this), "click", event);
        });
        me.ControllerInitialize();
        $.when(me.DoneInitializedPromise()).then(() => {
            var $me:any = $hostDiv;
            $me.foundation();
            var wnd:any=window;
            $me.find(".oip-modalbutton").on("click", wnd.ControllerCommon.ModalButtonClick);
            me.$myModals = $me.find(".oip-controller-modal");
            me.$myModals.data("oip-controller-instance", me);
        });
    }

    DoneInitializedPromise():JQueryPromise<any> {
        return this.$initialized;
    }

    CommonWaitForOperation(waitingText:string) {
        var jq:any = $;
        jq.blockUI({ message: "<h3>" + waitingText + "</h3>"});
    }

    CommonErrorHandler(jqXhr, textStatus, errorThrown) {
        var errorObject = JSON.parse(jqXhr.responseText);
        var wnd:any = window;
        wnd.DisplayErrorDialog("Error", errorObject.ErrorType, errorObject.ErrorText);
    }

    CommonSuccessHandler() {
        var jq:any = $;
        jq.unblockUI();
    }

    ControllerInitialize():void {
        throw "ControllerInitialize not implemented";
    }


    ControllerInitializeDone():void {
        this.$initialDeferred.resolve();
    }

    ReInitialize() {
        if(this.$myModals.length > 0) {
            this.$myModals.remove();
        }
        //var $hostDiv = $("#" + this.divID);
        var constructor = this.getClassConstructor(this);
        var vc:ViewControllerBase = new constructor(this.divID, this.currOPM, this.currUDG);
        vc.Initialize(this.dataUrl);
        vc.VisibleTemplateRender();
    }

    ExecuteCommand(commandName:string) {
        var commandFunction = this[commandName];
        if(_.isFunction(commandFunction)) {
            commandFunction.call(this);
        }
        else
            throw "Command implementing function not found: " + commandName
    }

    ExecuteOperation(operationDomain:string, operationName:string, parameters):any {
        var callBackName = operationName + "Callback";
        var callBack = this[callBackName];
        if(!_.isFunction(callBack)) {
            callBack = null;
        } else {
            callBack = function() {
                callBack.call(this);
            };
        }
        //this.currOPM.ExecuteOperationWithAjax(operationName, parameters, callBack);
        this.currOPM.ExecuteOperationWithForm(operationName, parameters, callBack);
    }

    getObjectByID(collection:any, id:string):any {
        for(var i = 0; i < collection.length; i++) {
            var currObj = collection[i];
            if(currObj.ID === id)
                return currObj;
        }
        return null;
    }

    VisibleTemplateRender():void {
        throw "VisibleTemplateRender not implemented";
    }

    InvisibleTemplateRender():void {
        throw "InvisibleTemplateRender not implemented";
    }

    handleEvent($source, eventName, eventData):void {
        var commandName = $source.data("oip-command");
        var commandFunction = this[commandName];
        if(!_.isFunction(commandFunction))
            throw "Controller's command function not implemented: " + commandName + " on hostind div: " + this.divID;;
        commandFunction.call(this, $source, eventName, eventData);
    }

    handleModalEvent($modal, $source, eventName, eventData):void {
        var commandName = "Modal_" + $source.data("oip-command");
        var commandFunction = this[commandName];
        if(!_.isFunction(commandFunction))
            throw "Controller's command function not implemented: " + commandName + " on hostind div: " + this.divID;;
        commandFunction.call(this, $modal, $source);
    }


    Modal_Common_CloseOpenModal($modal, $source) {
        $modal.foundation('reveal', 'close');
    }

    $getSelectedFieldWithinModal($modal, selector:string) {
        return $modal.find(selector);
    }

    $getNamedFieldWithinModal($modal, controlName):JQuery {
        return $modal.find("[name='" + controlName + "']");
    }

    $getSelectedFieldsWithin(selector:string):JQuery {
        var $hostDiv = $("#" + this.divID);
        return $hostDiv.find(selector);
    }

    $getNamedFieldWithin(controlName):JQuery {
        var $hostDiv = $("#" + this.divID);
        return $hostDiv.find("[name='" + controlName + "']");
    }

    constructor(public divID:string, public currOPM:TheBall.Interface.UI.OperationManager,
        public currUDG:TheBall.Interface.UI.UpdatingDataGetter) {
    }
}

export = ViewControllerBase;
