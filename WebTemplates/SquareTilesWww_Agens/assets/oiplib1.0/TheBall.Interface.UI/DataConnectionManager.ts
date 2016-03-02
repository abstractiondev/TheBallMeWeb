/**
 * Created by kalle on 27.1.2014.
 */

/// <reference path="jquery.d.ts" />


module TheBall.Interface.UI {
    export interface TrackerEvent {
        (trackedObject: TrackedObject, triggeredTick:string): void;
    }

    export class StatusData {
        ChangeItemTrackingList: string[];
    }

    export class TrackingExtension {
        LastUpdatedTick: string;
        FetchedUrl: string;
        ChangeListeners : TrackerEvent[] = [];
    }
    export class TrackedObject {
        ID: string;
        RelativeLocation:string;
        Name:string;
        SemanticDomainName:string;
        MasterETag:string;
        UIExtension: TrackingExtension;
        static GetRelativeUrl(currObject:TrackedObject): string {
            return currObject.RelativeLocation;
        }
        static UpdateObject(currObject:TrackedObject, triggeredTick: string, dcm:DataConnectionManager) {
            currObject.UIExtension.ChangeListeners.forEach(func => func(currObject, triggeredTick));
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
        }
    }

    export class DataConnectionManager {
        TrackedObjectStorage: { [ID: string]: TrackedObject } = {};
        LastProcessedTick: string = "";
        InitialTick: string = "";

        SetObjectInStorage(obj:TrackedObject) {
            var currObject = this.TrackedObjectStorage[obj.ID];
            this.TrackedObjectStorage[obj.ID] = obj;
            if(currObject) {
                obj.UIExtension = currObject.UIExtension;
            }
            this.setInnerObjectsInStorage(obj);
        }

        setInnerObjectsInStorage(obj:TrackedObject) {
            var dcm = this;
            if(typeof obj == "object") {
                $.each(obj, function(indexOrKey, innerObj) {
                    if(innerObj) {
                        if(innerObj.MasterETag) {
                            console.log("Added inner object: " + innerObj.RelativeLocation);
                            var currObject = dcm.TrackedObjectStorage[innerObj.ID];
                            if(currObject) {
                                innerObj.UIExtension = currObject.UIExtension;
                            }
                            dcm.TrackedObjectStorage[innerObj.ID] = innerObj;
                        }
                        dcm.setInnerObjectsInStorage(innerObj);
                    }
                });
            }
        }

        ProcessStatusData(statusData: StatusData) {
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
                if(!currProcessedTick)
                    currProcessedTick = currTimestamp;
                var currID = currItem.substr(2);
                var currModification = currItem.substr(0, 1);
                var currTracked = this.TrackedObjectStorage[currID];
                if(currTracked && currTracked.UIExtension && currTracked.UIExtension.LastUpdatedTick) {
                    console.log("Checking for update basis: " + currTracked.ID + " " +
                        currTracked.UIExtension.LastUpdatedTick + " vs " + currTimestamp);
                } else {
                    console.log("Not tracked update for id: " + currID);
                }
                if (currTracked && currTracked.UIExtension && currTracked.UIExtension.LastUpdatedTick < currTimestamp) {
                    console.log("Updating...");
                    TrackedObject.UpdateObject(currTracked, currTimestamp, this);
                }
            }
            if(currProcessedTick) {
                console.log("Processed up to tick: " + currProcessedTick)
                this.LastProcessedTick = currProcessedTick;
            }
        }

        constructor() {
            var initialStatusFetch = $.ajax({
                url: "../../TheBall.Interface/StatusSummary/default.json", cache: true,
                async: false
            });
            $.when(initialStatusFetch).then(function(data:StatusData) {
                var initialTimestamp;
                if(data.ChangeItemTrackingList.length > 0)
                    initialTimestamp = data.ChangeItemTrackingList[0];
                else
                    initialTimestamp = "T:";
                this.InitialTick = initialTimestamp;
            });
        }

        PerformAsyncPoll() {
            var priv = this;
            $.ajax({
                url: "../../TheBall.Interface/StatusSummary/default.json", cache: true,
                success: function(data:StatusData) {
                    //console.log("Polled status...");
                    priv.ProcessStatusData(data);
                }
            });
        }

        ProcessFetchedData(jsonData: TrackedObject) {
            if (jsonData.RelativeLocation) {
                var currTracked = this.TrackedObjectStorage[jsonData.ID];
                if (currTracked) {
                    var currExtension = currTracked.UIExtension;
                    this.TrackedObjectStorage[jsonData.ID] = jsonData;
                    currTracked = jsonData;
                    jsonData.UIExtension = currExtension;
                }
            }
        }

        FetchAndProcessJSONData(dataUrl: string) {
            $.ajax({
                url: dataUrl, cache: true,
                success: this.ProcessFetchedData
            });
        }

    }
}