/**
* Created by kalle on 29.1.2014.
*/
var TheBall;
(function (TheBall) {
    (function (Interface) {
        /// <reference path="jquery.d.ts" />
        /// <reference path="DataConnectionManager.ts" />
        /// <reference path="dustjs-linkedin.d.ts" />
        (function (UI) {
            var TemplateHook = (function () {
                function TemplateHook(templateName, jQuerySelector, dataSources, preRenderingDataProcessor, postRenderingDataProcessor, hiddenElementRendering) {
                    this.templateName = templateName;
                    this.jQuerySelector = jQuerySelector;
                    this.dataSources = dataSources;
                    this.preRenderingDataProcessor = preRenderingDataProcessor;
                    this.postRenderingDataProcessor = postRenderingDataProcessor;
                    this.hiddenElementRendering = hiddenElementRendering;
                }
                return TemplateHook;
            })();
            UI.TemplateHook = TemplateHook;

            var TimestampedFetch = (function () {
                function TimestampedFetch(Timestamp, FetchUrl, FetchCallBack) {
                    this.Timestamp = Timestamp;
                    this.FetchUrl = FetchUrl;
                    this.FetchCallBack = FetchCallBack;
                }
                TimestampedFetch.prototype.ExecuteAjaxToPromise = function () {
                    if (!this.ajaxPromise) {
                        this.ajaxPromise = this.ajaxPromise = $.ajax({
                            url: this.FetchUrl, cache: true,
                            success: this.FetchCallBack });
                    }
                    return this.ajaxPromise;
                };
                return TimestampedFetch;
            })();
            UI.TimestampedFetch = TimestampedFetch;

            var TemplateDataSource = (function () {
                function TemplateDataSource() {
                    this.UsedInTemplates = [];
                }
                TemplateDataSource.prototype.GetObjectContent = function () {
                    return this.DCM.TrackedObjectStorage[this.ObjectID];
                };

                /*
                RefreshObjectChange(trackedObject:TrackedObject, currTimestamp:string) {
                console.log("Refreshing object: " + trackedObject.ID + " used in: " + this.UsedInTemplates.join());
                this.TMM.RefreshNamedTemplates(currTimestamp, this.UsedInTemplates);
                }*/
                TemplateDataSource.prototype.RefreshTemplates = function (currTimestamp) {
                    this.TMM.RefreshNamedTemplates(currTimestamp, this.UsedInTemplates);
                };
                return TemplateDataSource;
            })();
            UI.TemplateDataSource = TemplateDataSource;

            var TemplateModuleManager = (function () {
                function TemplateModuleManager(dcm) {
                    this.DataSourceFetchStorage = {};
                    this.TemplateHookStorage = {};
                    if (!dcm)
                        dcm = new TheBall.Interface.UI.DataConnectionManager();
                    this.DCM = dcm;
                }
                TemplateModuleManager.prototype.CreateTimestampedFetchWithZeroTimestamp = function (fetchUrl, fetchCallBack) {
                    var tsFetch = new TimestampedFetch("", fetchUrl, fetchCallBack);
                    return tsFetch;
                };

                TemplateModuleManager.prototype.CreateObjectUpdateFetchPromise = function (timestamp, objectToUpdate) {
                    var me = this;
                    var tsFetch = new TimestampedFetch(timestamp, objectToUpdate.UIExtension.FetchedUrl, function (fetchedObject) {
                        fetchedObject.UIExtension = objectToUpdate.UIExtension;
                        fetchedObject.UIExtension.LastUpdatedTick = timestamp;
                        me.DCM.SetObjectInStorage(fetchedObject);
                    });
                    return tsFetch;
                };

                TemplateModuleManager.prototype.InitialObjectFetchCB = function (trackedObject, existingDataSource) {
                    var me = this;
                    if (trackedObject.ID) {
                        var id = trackedObject.ID;
                        trackedObject.UIExtension = new TheBall.Interface.UI.TrackingExtension();
                        trackedObject.UIExtension.FetchedUrl = existingDataSource.RelativeUrl;
                        trackedObject.UIExtension.ChangeListeners.push(function (refreshedObject, currTimestamp) {
                            if (existingDataSource.FetchInfo.Timestamp != currTimestamp) {
                                existingDataSource.FetchInfo = me.CreateObjectUpdateFetchPromise(currTimestamp, refreshedObject);
                                existingDataSource.RefreshTemplates(currTimestamp);
                            }
                        });
                        trackedObject.UIExtension.LastUpdatedTick = me.DCM.InitialTick; //me.DCM.LastProcessedTick;
                        this.DCM.SetObjectInStorage(trackedObject);
                    }
                    existingDataSource.ObjectID = trackedObject.ID;
                };

                TemplateModuleManager.prototype.InitiateTemplateDataSource = function (relativeUrl, templateName) {
                    var existingDataSource = this.DataSourceFetchStorage[relativeUrl];
                    var me = this;
                    if (!existingDataSource) {
                        existingDataSource = new TemplateDataSource();
                        existingDataSource.DCM = me.DCM;
                        existingDataSource.TMM = me;
                        existingDataSource.RelativeUrl = relativeUrl;
                        this.DataSourceFetchStorage[relativeUrl] = existingDataSource;
                        existingDataSource.FetchInfo = this.CreateTimestampedFetchWithZeroTimestamp(relativeUrl, function (trackedObject) {
                            me.InitialObjectFetchCB(trackedObject, existingDataSource);
                        });
                    }
                    existingDataSource.UsedInTemplates.push(templateName);
                    return existingDataSource;
                };

                TemplateModuleManager.prototype.RegisterAndReplaceTemplate = function (templateName, jQuerySelector, dataSourceUrls, preRenderingDataProcessor, postRenderingDataProcessor, hiddenElementRendering) {
                    if (this.TemplateHookStorage[templateName]) {
                        // TODO: Remove the old dataurl/object association
                        this.TemplateHookStorage[templateName] = null;
                    }
                    this.RegisterTemplate(templateName, jQuerySelector, dataSourceUrls, preRenderingDataProcessor, postRenderingDataProcessor, hiddenElementRendering);
                };

                TemplateModuleManager.prototype.RegisterTemplate = function (templateName, jQuerySelector, dataSourceUrls, preRenderingDataProcessor, postRenderingDataProcessor, hiddenElementRendering) {
                    var _this = this;
                    if (this.TemplateHookStorage[templateName])
                        throw "Template name already registered: " + templateName;
                    this.TemplateHookStorage[templateName] = new TemplateHook(templateName, jQuerySelector, dataSourceUrls.map(function (url) {
                        return _this.InitiateTemplateDataSource(url, templateName);
                    }), preRenderingDataProcessor, postRenderingDataProcessor, hiddenElementRendering);
                };

                TemplateModuleManager.prototype.ActivateTemplate = function (templateName, dataSources, contextPreparer, postRenderingDataProcessor, hiddenElementRendering, selectorString) {
                    this.RefreshTemplate("T:", templateName, dataSources, contextPreparer, postRenderingDataProcessor, hiddenElementRendering, selectorString);
                };

                TemplateModuleManager.prototype.RefreshTemplate = function (currTimestamp, templateName, dataSources, contextPreparer, postRenderingDataProcessor, hiddenElementRendering, selectorString) {
                    var me = this;
                    var promises;
                    var $matchedElements = $(selectorString);
                    var $visibleElements = $matchedElements.filter(":visible");
                    var $hiddenElements = $matchedElements.filter(":hidden");

                    if ($hiddenElements.length > 0) {
                        var $hiddenElementsToUpdate = $hiddenElements.not('[data-oiptimestamp="' + currTimestamp + '"][data-oipvisible="false"]');
                        if ($hiddenElementsToUpdate.length > 0) {
                            hiddenElementRendering(dataSources, $hiddenElementsToUpdate);
                            $hiddenElementsToUpdate.each(function () {
                                var $item = $(this);
                                $item.attr('data-oiptimestamp', currTimestamp);
                                $item.attr('data-oipvisible', 'false');
                            });
                        }
                    }

                    // If no visible, don't do anything
                    if ($visibleElements.length == 0) {
                        //console.log("Nothing visible on template: " + templateName);
                        return;
                    }

                    //console.log("Checking visibility updates: " + templateName);
                    var $visibleToUpdate = $visibleElements.not('[data-oiptimestamp="' + currTimestamp + '"][data-oipvisible="true"]');
                    if ($visibleToUpdate.length == 0) {
                        //console.log("Nothing to update: " + templateName);
                        return;
                    }

                    $visibleToUpdate.each(function () {
                        var $item = $(this);
                        $item.attr('data-oiptimestamp', currTimestamp);
                        $item.attr('data-oipvisible', 'true');
                    });

                    console.log("Promise execution: " + templateName);
                    promises = dataSources.map(function (obj) {
                        return obj.FetchInfo.ExecuteAjaxToPromise();
                    });
                    $.when.apply($, promises).then(function () {
                        console.log("Root object fetch");
                        var dustRootObject = contextPreparer(dataSources);
                        console.log("Rendering dust: " + templateName);
                        dust.render(templateName, dustRootObject, function (error, output) {
                            console.log("Done rendering");
                            console.log(output.substr(0, 20));
                            $visibleToUpdate.each(function () {
                                var $item = $(this);
                                $item.html(output);
                            });
                            if (postRenderingDataProcessor)
                                postRenderingDataProcessor(dataSources, $visibleToUpdate);
                        });
                    });
                };

                TemplateModuleManager.prototype.ActivateNamedTemplates = function (templateNames) {
                    var me = this;
                    for (var i = 0; i < templateNames.length; i++) {
                        var index = templateNames[i];
                        var tHook = this.TemplateHookStorage[index];
                        me.ActivateTemplate(tHook.templateName, tHook.dataSources, tHook.preRenderingDataProcessor, tHook.postRenderingDataProcessor, tHook.hiddenElementRendering, tHook.jQuerySelector);
                    }
                };

                TemplateModuleManager.prototype.RefreshNamedTemplates = function (currTimestamp, templateNames) {
                    var me = this;
                    for (var i = 0; i < templateNames.length; i++) {
                        var index = templateNames[i];
                        var tHook = this.TemplateHookStorage[index];
                        me.RefreshTemplate(currTimestamp, tHook.templateName, tHook.dataSources, tHook.preRenderingDataProcessor, tHook.postRenderingDataProcessor, tHook.hiddenElementRendering, tHook.jQuerySelector);
                    }
                };

                TemplateModuleManager.prototype.ActivateAllTemplates = function () {
                    var me = this;
                    for (var index in this.TemplateHookStorage) {
                        var tHook = this.TemplateHookStorage[index];
                        me.ActivateTemplate(tHook.templateName, tHook.dataSources, tHook.preRenderingDataProcessor, tHook.postRenderingDataProcessor, tHook.hiddenElementRendering, tHook.jQuerySelector);
                    }
                };

                TemplateModuleManager.prototype.RefreshAllTemplateVisibility = function () {
                    var me = this;
                    for (var index in me.TemplateHookStorage) {
                        var tHook = me.TemplateHookStorage[index];
                        var lastTimestamp = "";
                        tHook.dataSources.forEach(function (ds) {
                            if (lastTimestamp < ds.FetchInfo.Timestamp)
                                lastTimestamp = ds.FetchInfo.Timestamp;
                        });
                        me.RefreshTemplate(lastTimestamp, tHook.templateName, tHook.dataSources, tHook.preRenderingDataProcessor, tHook.postRenderingDataProcessor, tHook.hiddenElementRendering, tHook.jQuerySelector);
                    }
                };
                return TemplateModuleManager;
            })();
            UI.TemplateModuleManager = TemplateModuleManager;
        })(Interface.UI || (Interface.UI = {}));
        var UI = Interface.UI;
    })(TheBall.Interface || (TheBall.Interface = {}));
    var Interface = TheBall.Interface;
})(TheBall || (TheBall = {}));
