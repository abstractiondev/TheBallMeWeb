/**
 * Created by kalle on 12.5.2014.
 */
/// <reference path="jquery.d.ts" />
var TheBall;
(function (TheBall) {
    var Interface;
    (function (Interface) {
        var UI;
        (function (UI) {
            var ResourceLocatedObject = (function () {
                function ResourceLocatedObject(isJSONUrl, urlKey, constructData, onUpdate, boundToElements, boundToObjects, dataSourceObjects) {
                    this.isJSONUrl = isJSONUrl;
                    this.urlKey = urlKey;
                    this.constructData = constructData;
                    this.onUpdate = onUpdate;
                    this.boundToElements = boundToElements;
                    this.boundToObjects = boundToObjects;
                    this.dataSourceObjects = dataSourceObjects;
                    // Initialize to empty arrays if not given
                    this.onUpdate = onUpdate || [];
                    this.boundToElements = boundToElements || [];
                    this.boundToObjects = boundToObjects || [];
                    this.dataSourceObjects = dataSourceObjects || [];
                }
                return ResourceLocatedObject;
            })();
            UI.ResourceLocatedObject = ResourceLocatedObject;
            var UpdatingDataGetter = (function () {
                function UpdatingDataGetter() {
                    this.TrackedURLDictionary = {};
                }
                UpdatingDataGetter.prototype.registerSourceUrls = function (sourceUrls) {
                    var _this = this;
                    sourceUrls.forEach(function (sourceUrl) {
                        if (!_this.TrackedURLDictionary[sourceUrl]) {
                            var sourceIsJson = _this.isJSONUrl(sourceUrl);
                            if (!sourceIsJson)
                                throw "Local source URL needs to be defined before using as source";
                            var source = new ResourceLocatedObject(sourceIsJson, sourceUrl, null);
                            _this.TrackedURLDictionary[sourceUrl] = source;
                        }
                    });
                };
                UpdatingDataGetter.prototype.isJSONUrl = function (url) {
                    return url.indexOf("/") != -1;
                };
                UpdatingDataGetter.prototype.getOrRegisterUrl = function (url) {
                    var rlObj = this.TrackedURLDictionary[url];
                    if (!rlObj) {
                        var sourceIsJson = this.isJSONUrl(url);
                        rlObj = new ResourceLocatedObject(sourceIsJson, url, null);
                        this.TrackedURLDictionary[url] = rlObj;
                    }
                    return rlObj;
                };
                UpdatingDataGetter.prototype.RegisterAndBindDataToElements = function (boundToElements, url, onUpdate, sourceUrls) {
                    var _this = this;
                    if (sourceUrls)
                        this.registerSourceUrls(sourceUrls);
                    var rlObj = this.getOrRegisterUrl(url);
                    if (sourceUrls) {
                        rlObj.dataSourceObjects = sourceUrls.map(function (sourceUrl) {
                            return _this.TrackedURLDictionary[sourceUrl];
                        });
                    }
                };
                UpdatingDataGetter.prototype.RegisterDataURL = function (url, onConstruct, sourceUrls) {
                    var me = this;
                    var rlObj = me.getOrRegisterUrl(url);
                    rlObj.constructData = onConstruct;
                    if (sourceUrls) {
                        me.registerSourceUrls(sourceUrls);
                        rlObj.dataSourceObjects = sourceUrls.map(function (sourceUrl) {
                            return me.getOrRegisterUrl(sourceUrl);
                        });
                    }
                    return rlObj;
                };
                UpdatingDataGetter.prototype.UnregisterDataUrl = function (url) {
                    if (this.TrackedURLDictionary[url])
                        delete this.TrackedURLDictionary[url];
                };
                UpdatingDataGetter.prototype.GetData = function (url, callback) {
                    var rlObj = this.TrackedURLDictionary[url];
                    if (!rlObj)
                        throw "Data URL needs to be registered before GetData: " + url;
                    if (rlObj.isJSONUrl) {
                        $.getJSON(url, function (content) {
                            callback(content);
                        });
                    }
                    else {
                        var prom = this.getDataPromise(url);
                        $.when(prom).then(function (content) {
                            return callback(content);
                        });
                    }
                };
                UpdatingDataGetter.prototype.getDataPromise = function (url) {
                    var me = this;
                    var rlObj = this.TrackedURLDictionary[url];
                    if (!rlObj)
                        throw "Data URL needs to be registered before getDataPromise: " + url;
                    var result;
                    if (rlObj.isJSONUrl) {
                        result = $.ajax({ url: url });
                    }
                    else {
                        var promises = rlObj.dataSourceObjects.map(function (dsObj) {
                            return me.getDataPromise(dsObj.urlKey);
                        });
                        result = $.Deferred();
                        $.when.apply($, promises).then(function () {
                            var args = arguments;
                            var value = rlObj.constructData(args);
                            return result.resolve(value);
                        });
                    }
                    return result;
                };
                return UpdatingDataGetter;
            })();
            UI.UpdatingDataGetter = UpdatingDataGetter;
        })(UI = Interface.UI || (Interface.UI = {}));
    })(Interface = TheBall.Interface || (TheBall.Interface = {}));
})(TheBall || (TheBall = {}));
