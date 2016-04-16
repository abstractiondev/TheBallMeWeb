/**
 * Created by kalle on 29.1.2014.
 */


/// <reference path="jquery.d.ts" />
/// <reference path="DataConnectionManager.ts" />
/// <reference path="dustjs-linkedin.d.ts" />

module TheBall.Interface.UI {

    export interface DataPreparerCallback {
        (jsonContents: TemplateDataSource[]): any;
    }
    export interface PostRenderingCallback {
        (jsonContents: TemplateDataSource[], renderedOnElements:JQuery) : any;
    }
    export interface HiddenElementRenderingCallback {
        (jsonContents: TemplateDataSource[], hiddenElements:JQuery) : any;
    }

    export class TemplateHook {
        constructor(public templateName:string,
            public jQuerySelector:string,
            public dataSources:TemplateDataSource[],
            public preRenderingDataProcessor:DataPreparerCallback,
            public postRenderingDataProcessor:PostRenderingCallback,
            public hiddenElementRendering:HiddenElementRenderingCallback) {
        }
    }

    export class TimestampedFetch {
        private ajaxPromise : any;
        constructor(public Timestamp:string, public FetchUrl:string, public FetchCallBack : (trackedObject: TrackedObject) => void) {
        }
        ExecuteAjaxToPromise(): any {
            if(!this.ajaxPromise) {
                this.ajaxPromise = this.ajaxPromise = $.ajax({ url: this.FetchUrl, cache:true,
                    success: this.FetchCallBack});
            }
            return this.ajaxPromise;
        }
    }

    export class TemplateDataSource {
        RelativeUrl: string;
        ObjectID: string;
        FetchInfo: TimestampedFetch;
        DCM: DataConnectionManager;
        TMM: TemplateModuleManager;
        UsedInTemplates: string[] = [];
        GetObjectContent() : TrackedObject {
            return this.DCM.TrackedObjectStorage[this.ObjectID];
        }
        /*
        RefreshObjectChange(trackedObject:TrackedObject, currTimestamp:string) {
            console.log("Refreshing object: " + trackedObject.ID + " used in: " + this.UsedInTemplates.join());
            this.TMM.RefreshNamedTemplates(currTimestamp, this.UsedInTemplates);
        }*/
        RefreshTemplates(currTimestamp:string) {
            this.TMM.RefreshNamedTemplates(currTimestamp, this.UsedInTemplates);
        }
    }

    export class TemplateModuleManager {
        DCM : DataConnectionManager;
        constructor(dcm:DataConnectionManager) {
            if(!dcm)
                dcm = new TheBall.Interface.UI.DataConnectionManager();
            this.DCM = dcm;
        }

        DataSourceFetchStorage: { [RelativeUrl: string]: TemplateDataSource } = {};
        private TemplateHookStorage: { [TemplateName: string]: TemplateHook } = {};

        CreateTimestampedFetchWithZeroTimestamp(fetchUrl: string, fetchCallBack : (trackedObject: TrackedObject) => void) :TimestampedFetch {
            var tsFetch:TimestampedFetch = new TimestampedFetch("", fetchUrl, fetchCallBack);
            return tsFetch;
        }

        CreateObjectUpdateFetchPromise(timestamp:string, objectToUpdate:TrackedObject) : TimestampedFetch {
            var me = this;
            var tsFetch:TimestampedFetch = new TimestampedFetch(timestamp, objectToUpdate.UIExtension.FetchedUrl, (fetchedObject:TrackedObject) => {
                fetchedObject.UIExtension = objectToUpdate.UIExtension;
                fetchedObject.UIExtension.LastUpdatedTick = timestamp;
                me.DCM.SetObjectInStorage(fetchedObject);
            });
            return tsFetch;
        }

        InitialObjectFetchCB(trackedObject:TrackedObject, existingDataSource:TemplateDataSource) {
            var me = this;
            if(trackedObject.ID) {
                var id = trackedObject.ID;
                trackedObject.UIExtension = new TheBall.Interface.UI.TrackingExtension();
                trackedObject.UIExtension.FetchedUrl = existingDataSource.RelativeUrl;
                trackedObject.UIExtension.ChangeListeners.push(
                    (refreshedObject:TrackedObject, currTimestamp:string) => {
                        if(existingDataSource.FetchInfo.Timestamp != currTimestamp) {
                            existingDataSource.FetchInfo = me.CreateObjectUpdateFetchPromise(currTimestamp, refreshedObject);
                            existingDataSource.RefreshTemplates(currTimestamp);
                        }
                    });
                trackedObject.UIExtension.LastUpdatedTick = me.DCM.InitialTick; //me.DCM.LastProcessedTick;
                this.DCM.SetObjectInStorage(trackedObject);
            }
            existingDataSource.ObjectID = trackedObject.ID;
        }

        InitiateTemplateDataSource(relativeUrl: string, templateName:string): TemplateDataSource {
            var existingDataSource = this.DataSourceFetchStorage[relativeUrl];
            var me = this;
            if (!existingDataSource) {
                existingDataSource = new TemplateDataSource();
                existingDataSource.DCM = me.DCM;
                existingDataSource.TMM = me;
                existingDataSource.RelativeUrl = relativeUrl;
                this.DataSourceFetchStorage[relativeUrl] = existingDataSource;
                existingDataSource.FetchInfo = this.CreateTimestampedFetchWithZeroTimestamp(relativeUrl,
                    function (trackedObject: TrackedObject) {
                        me.InitialObjectFetchCB(trackedObject, existingDataSource);
                    });
            }
            existingDataSource.UsedInTemplates.push(templateName);
            return existingDataSource;
        }

        RegisterAndReplaceTemplate(templateName:string, jQuerySelector:string, dataSourceUrls:string[], preRenderingDataProcessor:DataPreparerCallback,
                         postRenderingDataProcessor:PostRenderingCallback, hiddenElementRendering:HiddenElementRenderingCallback) {
            if(this.TemplateHookStorage[templateName])
            {
                // TODO: Remove the old dataurl/object association
                this.TemplateHookStorage[templateName] = null;
            }
            this.RegisterTemplate(templateName, jQuerySelector, dataSourceUrls, preRenderingDataProcessor,
                postRenderingDataProcessor, hiddenElementRendering);
        }

        RegisterTemplate(templateName:string, jQuerySelector:string, dataSourceUrls:string[], preRenderingDataProcessor:DataPreparerCallback,
                         postRenderingDataProcessor:PostRenderingCallback, hiddenElementRendering:HiddenElementRenderingCallback) {
            if(this.TemplateHookStorage[templateName])
                throw "Template name already registered: " + templateName;
            this.TemplateHookStorage[templateName] = new TemplateHook(templateName,
                jQuerySelector,
                dataSourceUrls.map(url => this.InitiateTemplateDataSource(url, templateName)),
                preRenderingDataProcessor, postRenderingDataProcessor, hiddenElementRendering);
        }

        ActivateTemplate(templateName: string, dataSources: TemplateDataSource[], contextPreparer: DataPreparerCallback, postRenderingDataProcessor:PostRenderingCallback, hiddenElementRendering:HiddenElementRenderingCallback, selectorString: string) {
            this.RefreshTemplate("T:", templateName, dataSources, contextPreparer, postRenderingDataProcessor, hiddenElementRendering, selectorString);
        }

        RefreshTemplate(currTimestamp:string, templateName: string, dataSources: TemplateDataSource[], contextPreparer: DataPreparerCallback, postRenderingDataProcessor:PostRenderingCallback, hiddenElementRendering:HiddenElementRenderingCallback, selectorString: string) {
            var me = this;
            var promises: any[];
            var $matchedElements = $(selectorString);
            var $visibleElements = $matchedElements.filter(":visible");
            var $hiddenElements = $matchedElements.filter(":hidden");

            if($hiddenElements.length > 0) {
                var $hiddenElementsToUpdate = $hiddenElements
                    .not('[data-oiptimestamp="' + currTimestamp + '"][data-oipvisible="false"]');
                if($hiddenElementsToUpdate.length > 0) {
                    hiddenElementRendering(dataSources, $hiddenElementsToUpdate);
                    $hiddenElementsToUpdate.each(function() {
                        var $item = $(this);
                        $item.attr('data-oiptimestamp', currTimestamp);
                        $item.attr('data-oipvisible', 'false');
                    });
                }
            }
            // If no visible, don't do anything
            if($visibleElements.length == 0) {
                //console.log("Nothing visible on template: " + templateName);
                return;
            }

            //console.log("Checking visibility updates: " + templateName);

            var $visibleToUpdate = $visibleElements
                .not('[data-oiptimestamp="' + currTimestamp + '"][data-oipvisible="true"]');
            if($visibleToUpdate.length == 0) {
                //console.log("Nothing to update: " + templateName);
                return;
            }

            $visibleToUpdate.each(function() {
                var $item = $(this);
                $item.attr('data-oiptimestamp', currTimestamp);
                $item.attr('data-oipvisible', 'true');
            });

            console.log("Promise execution: " + templateName);
            promises = dataSources.map(obj => obj.FetchInfo.ExecuteAjaxToPromise());
            $.when.apply($, promises).then(() => {
                console.log("Root object fetch");
                var dustRootObject = contextPreparer(dataSources);
                console.log("Rendering dust: " + templateName);
                dust.render(templateName, dustRootObject,(error, output) => {
                    console.log("Done rendering");
                    console.log(output.substr(0, 20));
                    $visibleToUpdate.each(function() {
                        var $item = $(this);
                        $item.html(output);
                    });
                    if(postRenderingDataProcessor)
                        postRenderingDataProcessor(dataSources, $visibleToUpdate);
                });
            });
        }

        ActivateNamedTemplates(templateNames:string[]) {
            var me = this;
            for(var i = 0; i < templateNames.length; i++) {
                var index = templateNames[i];
                var tHook = this.TemplateHookStorage[index];
                me.ActivateTemplate(tHook.templateName,
                    tHook.dataSources,
                    tHook.preRenderingDataProcessor,
                    tHook.postRenderingDataProcessor,
                    tHook.hiddenElementRendering,
                    tHook.jQuerySelector);
            }
        }

        RefreshNamedTemplates(currTimestamp:string, templateNames:string[]) {
            var me = this;
            for(var i = 0; i < templateNames.length; i++) {
                var index = templateNames[i];
                var tHook = this.TemplateHookStorage[index];
                me.RefreshTemplate(currTimestamp,
                    tHook.templateName,
                    tHook.dataSources,
                    tHook.preRenderingDataProcessor,
                    tHook.postRenderingDataProcessor,
                    tHook.hiddenElementRendering,
                    tHook.jQuerySelector);
            }
        }

        ActivateAllTemplates() {
            var me = this;
            for(var index in this.TemplateHookStorage) {
                var tHook = this.TemplateHookStorage[index];
                me.ActivateTemplate(tHook.templateName,
                    tHook.dataSources,
                    tHook.preRenderingDataProcessor,
                    tHook.postRenderingDataProcessor,
                    tHook.hiddenElementRendering,
                    tHook.jQuerySelector);

            }
        }

        RefreshAllTemplateVisibility() {
            var me = this;
            for(var index in me.TemplateHookStorage) {
                var tHook = me.TemplateHookStorage[index];
                var lastTimestamp = "";
                tHook.dataSources.forEach((ds:TemplateDataSource) => {
                    if(lastTimestamp < ds.FetchInfo.Timestamp)
                        lastTimestamp = ds.FetchInfo.Timestamp;
                });
                me.RefreshTemplate(lastTimestamp,
                    tHook.templateName,
                    tHook.dataSources,
                    tHook.preRenderingDataProcessor,
                    tHook.postRenderingDataProcessor,
                    tHook.hiddenElementRendering,
                    tHook.jQuerySelector);
            }
        }
    }

}