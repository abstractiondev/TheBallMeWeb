/**
 * Created by kalle on 12.5.2014.
 */
/// <reference path="jquery.d.ts" />

module TheBall.Interface.UI {
    export class ResourceLocatedObject {
        constructor(public isJSONUrl:boolean, public urlKey:string,
            public constructData : ConstructDataObject,
            public onUpdate? :UpdateDataObjectEvent[],
            public boundToElements? :JQuery[],
            public boundToObjects? :ResourceLocatedObject[],
            public dataSourceObjects? :ResourceLocatedObject[]) {
            // Initialize to empty arrays if not given
            this.onUpdate = onUpdate || [];
            this.boundToElements = boundToElements || [];
            this.boundToObjects = boundToObjects || [];
            this.dataSourceObjects = dataSourceObjects || [];
        }
    }

    export interface UpdateDataObjectEvent {
        (objectToUpdate: ResourceLocatedObject, sourceObjects:ResourceLocatedObject[]): boolean;
    }

    export interface ConstructDataObject {
        (args: any) : any;
    }

    export interface DataRetrievedEvent {
        (content: any): void;
    }

    export class UpdatingDataGetter {
        TrackedURLDictionary: { [URL:string]: ResourceLocatedObject} = {};

        registerSourceUrls(sourceUrls:string[]) {
            sourceUrls.forEach(sourceUrl => {
                if(!this.TrackedURLDictionary[sourceUrl]) {
                    var sourceIsJson = this.isJSONUrl(sourceUrl);
                    if(!sourceIsJson)
                        throw "Local source URL needs to be defined before using as source";
                    var source = new ResourceLocatedObject(sourceIsJson, sourceUrl, null);
                    this.TrackedURLDictionary[sourceUrl] = source;
                }
            });
        }

        isJSONUrl(url:string) {
            return url.indexOf("/") != -1;
        }

        getOrRegisterUrl(url:string) {
            var rlObj = this.TrackedURLDictionary[url];
            if(!rlObj) {
                var sourceIsJson = this.isJSONUrl(url);
                rlObj = new ResourceLocatedObject(sourceIsJson, url, null);
                this.TrackedURLDictionary[url] = rlObj;
            }
            return rlObj;
        }

        RegisterAndBindDataToElements(boundToElements:JQuery, url:string, onUpdate:UpdateDataObjectEvent, sourceUrls:string[]) {
            if(sourceUrls)
                this.registerSourceUrls(sourceUrls);
            var rlObj = this.getOrRegisterUrl(url);
            if(sourceUrls) {
                rlObj.dataSourceObjects = sourceUrls.map(sourceUrl => {
                    return this.TrackedURLDictionary[sourceUrl];
                });
            }
        }

        RegisterDataURL(url:string, onConstruct:ConstructDataObject, sourceUrls:string[]) : ResourceLocatedObject {
            var me = this;
            var rlObj = me.getOrRegisterUrl(url);
            rlObj.constructData = onConstruct;
            if(sourceUrls) {
                me.registerSourceUrls(sourceUrls);
                rlObj.dataSourceObjects = sourceUrls.map(sourceUrl => {
                    return me.getOrRegisterUrl(sourceUrl);
                });
            }
            return rlObj;
        }

        UnregisterDataUrl(url:string) {
            if(this.TrackedURLDictionary[url])
                delete this.TrackedURLDictionary[url];
        }

        GetData(url:string, callback:DataRetrievedEvent) {
            var rlObj = this.TrackedURLDictionary[url];
            if(!rlObj)
                throw "Data URL needs to be registered before GetData: " + url;
            if(rlObj.isJSONUrl) {
                $.getJSON(url, content => {
                    callback(content);
                });
            } else {
                var prom = this.getDataPromise(url);
                $.when(prom).then(function(content) {
                    return callback(content);
                });
            }
        }

        getDataPromise(url:string) : JQueryPromise<any> {
            var me = this;
            var rlObj = this.TrackedURLDictionary[url];
            if(!rlObj)
                throw "Data URL needs to be registered before getDataPromise: " + url;
            var result;
            if(rlObj.isJSONUrl) {
                result = $.ajax({ url: url});
            }
            else {
                var promises = rlObj.dataSourceObjects.map(dsObj => {
                    return me.getDataPromise(dsObj.urlKey);
                });
                result = $.Deferred();
                $.when.apply($, promises).then(function() {
                    var args = arguments;
                    var value = rlObj.constructData(args);
                    return result.resolve(value);
                });
            }
            return result;
        }
    }
}