/**
 * Created by kalle on 27.1.2014.
 */
/// <reference path="jquery.d.ts" />
var TheBall;
(function (TheBall) {
    var Interface;
    (function (Interface) {
        var UI;
        (function (UI) {
            var StatusData = (function () {
                function StatusData() {
                }
                return StatusData;
            })();
            UI.StatusData = StatusData;
            var TrackingExtension = (function () {
                function TrackingExtension() {
                    this.ChangeListeners = [];
                }
                return TrackingExtension;
            })();
            UI.TrackingExtension = TrackingExtension;
            var TrackedObject = (function () {
                function TrackedObject() {
                }
                TrackedObject.GetRelativeUrl = function (currObject) {
                    return currObject.RelativeLocation;
                };
                TrackedObject.UpdateObject = function (currObject, triggeredTick, dcm) {
                    currObject.UIExtension.ChangeListeners.forEach(function (func) { return func(currObject, triggeredTick); });
                    //var fetchUrl = TrackedObject.GetRelativeUrl(currObject);
                    //var templateDataSource =
                    /*
                     var fetchUrl = currObject.UIExtension.FetchedUrl;
                     console.log("Fetching from url: " + fetchUrl);
                     $.ajax( { url : fetchUrl, cache: false,
                     success: function(updatedObject:TrackedObject) {
                     dcm.SetObjectInStorage(updatedObject);
                     updatedObject.UIExtension.LastUpdatedTick = triggeredTick;
                     updatedObject.UIExtension.ChangeListeners.forEach(func => func(updatedObject));
                     }
                     });*/
                };
                return TrackedObject;
            })();
            UI.TrackedObject = TrackedObject;
            var DataConnectionManager = (function () {
                function DataConnectionManager() {
                    this.TrackedObjectStorage = {};
                    this.LastProcessedTick = "";
                    this.InitialTick = "";
                    var initialStatusFetch = $.ajax({
                        url: "../../TheBall.Interface/StatusSummary/default.json", cache: true,
                        async: false
                    });
                    $.when(initialStatusFetch).then(function (data) {
                        var initialTimestamp;
                        if (data.ChangeItemTrackingList.length > 0)
                            initialTimestamp = data.ChangeItemTrackingList[0];
                        else
                            initialTimestamp = "T:";
                        this.InitialTick = initialTimestamp;
                    });
                }
                DataConnectionManager.prototype.SetObjectInStorage = function (obj) {
                    var currObject = this.TrackedObjectStorage[obj.ID];
                    this.TrackedObjectStorage[obj.ID] = obj;
                    if (currObject) {
                        obj.UIExtension = currObject.UIExtension;
                    }
                    this.setInnerObjectsInStorage(obj);
                };
                DataConnectionManager.prototype.setInnerObjectsInStorage = function (obj) {
                    var dcm = this;
                    if (typeof obj == "object") {
                        $.each(obj, function (indexOrKey, innerObj) {
                            if (innerObj) {
                                if (innerObj.MasterETag) {
                                    console.log("Added inner object: " + innerObj.RelativeLocation);
                                    var currObject = dcm.TrackedObjectStorage[innerObj.ID];
                                    if (currObject) {
                                        innerObj.UIExtension = currObject.UIExtension;
                                    }
                                    dcm.TrackedObjectStorage[innerObj.ID] = innerObj;
                                }
                                dcm.setInnerObjectsInStorage(innerObj);
                            }
                        });
                    }
                };
                DataConnectionManager.prototype.ProcessStatusData = function (statusData) {
                    var idList = statusData.ChangeItemTrackingList;
                    var currTimestamp;
                    var currProcessedTick;
                    for (var i = 0; i < idList.length; i++) {
                        var currItem = idList[i];
                        if (currItem.charAt(0) == "T") {
                            currTimestamp = currItem;
                            if (currTimestamp <= this.LastProcessedTick)
                                break;
                            continue;
                        }
                        // If curr processed is undefined, we set it from here, thus it will be last
                        if (!currProcessedTick)
                            currProcessedTick = currTimestamp;
                        var currID = currItem.substr(2);
                        var currModification = currItem.substr(0, 1);
                        var currTracked = this.TrackedObjectStorage[currID];
                        if (currTracked && currTracked.UIExtension && currTracked.UIExtension.LastUpdatedTick) {
                            console.log("Checking for update basis: " + currTracked.ID + " " +
                                currTracked.UIExtension.LastUpdatedTick + " vs " + currTimestamp);
                        }
                        else {
                            console.log("Not tracked update for id: " + currID);
                        }
                        if (currTracked && currTracked.UIExtension && currTracked.UIExtension.LastUpdatedTick < currTimestamp) {
                            console.log("Updating...");
                            TrackedObject.UpdateObject(currTracked, currTimestamp, this);
                        }
                    }
                    if (currProcessedTick) {
                        console.log("Processed up to tick: " + currProcessedTick);
                        this.LastProcessedTick = currProcessedTick;
                    }
                };
                DataConnectionManager.prototype.PerformAsyncPoll = function () {
                    var priv = this;
                    $.ajax({
                        url: "../../TheBall.Interface/StatusSummary/default.json", cache: true,
                        success: function (data) {
                            //console.log("Polled status...");
                            priv.ProcessStatusData(data);
                        }
                    });
                };
                DataConnectionManager.prototype.ProcessFetchedData = function (jsonData) {
                    if (jsonData.RelativeLocation) {
                        var currTracked = this.TrackedObjectStorage[jsonData.ID];
                        if (currTracked) {
                            var currExtension = currTracked.UIExtension;
                            this.TrackedObjectStorage[jsonData.ID] = jsonData;
                            currTracked = jsonData;
                            jsonData.UIExtension = currExtension;
                        }
                    }
                };
                DataConnectionManager.prototype.FetchAndProcessJSONData = function (dataUrl) {
                    $.ajax({
                        url: dataUrl, cache: true,
                        success: this.ProcessFetchedData
                    });
                };
                return DataConnectionManager;
            })();
            UI.DataConnectionManager = DataConnectionManager;
        })(UI = Interface.UI || (Interface.UI = {}));
    })(Interface = TheBall.Interface || (TheBall.Interface = {}));
})(TheBall || (TheBall = {}));
