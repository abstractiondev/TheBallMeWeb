/**
 * Created by kalle on 31.5.2014.
 */

/// <reference path="require.d.ts" />

require.config({
    "baseUrl": "../assets/controlpanel/modules/",
    "paths": {
        /*
        "dust": "//cdnjs.cloudflare.com/ajax/libs/dustjs-linkedin/2.0.0/dust-core.min",
         "underscore": "//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.underscore.min"
         "dust": "//cdnjs.cloudflare.com/ajax/libs/dustjs-linkedin/2.0.0/dust-core.min",
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min",
        "foundation": "../js/foundation.min",
        "jqueryisotope": "../js/jquery.isotope",
        "jqueryform": "../js/jquery.form.min",
        "redactor": "../js/redactor.min",
        "jqueryclean": "../js/jquery.htmlClean.min",
        "markdowndeep": "../js/markdowndeep/MarkdownDeepLib.min",
        "templatemodulemanager": "../../oiplib1.0/TheBall.Interface.UI/TemplateModuleManager",
        "dataconnectionmanager": "../../oiplib1.0/TheBall.Interface.UI/DataConnectionManager",
        "operationmanager": "../../oiplib1.0/TheBall.Interface.UI/OperationManager",
        "updatingdatagetter": "../../oiplib1.0/TheBall.Interface.UI/UpdatingDataGetter"
        */
        //"main": "boot/main"
    },
    shim: {
        /*,
        "dust": {
            exports: "dust"
        },
        "underscore": {
            exports: "_"
        }
        dust: {
            exports: "dust"
        }
        jquery: {
            exports: "$"
        },
        jqueryform:["jquery"],
        jqueryclean:["jquery"],
        underscore: {
            exports: "_"
        },
        dust: {
            exports: "dust"
        },
        jqueryisotope:["jquery"],
        redactor:[],
        markdowndeep:[],
        dataconnectionmanager: {
            deps:["jquery"],
            exports: "TheBall.Interface.UI"
        },
        templatemodulemanager: {
            deps: ["dataconnectionmanager", "jquery", "dust"]
        },
        operationmanager: {
            deps: ["dataconnectionmanager", "jquery"]
        },
        updatingdatagetter:["jquery"]
        */
    }

    /*,
     backbone: {
     deps: ['underscore', 'jquery'],
     exports: 'Backbone'
     }*/

});

require(["main" ], (main) => {
    var app = new main.AppMain();
    app.run();
});
