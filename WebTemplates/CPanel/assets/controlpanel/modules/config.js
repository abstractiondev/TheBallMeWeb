/**
* Created by kalle on 31.5.2014.
*/
/// <reference path="require.d.ts" />
require.config({
    "baseUrl": "../assets/controlpanel/modules/",
    "paths": {},
    shim: {}
});

require(["main"], function (main) {
    var app = new main.AppMain();
    app.run();
});
