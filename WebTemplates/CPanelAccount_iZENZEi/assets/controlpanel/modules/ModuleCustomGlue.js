/**
* Created by kalle on 2.6.2014.
*/
var AppScripts;
(function (AppScripts) {
    var Common = (function () {
        function Common() {
        }
        Common.ConvertCategoriesFromParentToChildren = function (categoryArray) {
            var map = {};
            map["-"] = {
                UI_ChildrenCategories: []
            };
            for (var i = 0; i < categoryArray.length; i++) {
                var obj = categoryArray[i];
                obj.UI_ChildrenCategories = [];
                map[obj.ID] = obj;
            }
            for (var i = 0; i < categoryArray.length; i++) {
                var obj = categoryArray[i];
                var parentID = obj.ParentCategoryID ? obj.ParentCategoryID : "-";
                if (!map[parentID]) {
                    /*
                    map[parentID] = {
                    UI_ChildrenCategories: []
                    };*/
                    parentID = "-";
                }
                map[parentID].UI_ChildrenCategories.push(obj);
            }
            if (categoryArray.length == 0)
                return [];
            return map["-"].UI_ChildrenCategories;
        };
        return Common;
    })();
    AppScripts.Common = Common;
})(AppScripts || (AppScripts = {}));
