/**
* Created by kalle on 3.6.2014.
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../ViewControllerBase"], function(require, exports, ViewControllerBase) {
    var WebShopViewController = (function (_super) {
        __extends(WebShopViewController, _super);
        function WebShopViewController() {
            _super.apply(this, arguments);
        }
        WebShopViewController.prototype.ControllerInitialize = function () {
            var _this = this;
            var me = this;
            require([
                "WebShopView/WebShop_dust",
                "lib/dusts/command_button_begin_dust",
                "lib/dusts/command_button_end_dust",
                "lib/dusts/command_button_dust",
                "lib/dusts/modal_begin_dust",
                "lib/dusts/textinput_singleline_dust",
                "lib/dusts/modal_end_dust",
                "lib/dusts/hiddeninput_dust",
                "lib/dusts/openmodal_button_dust",
                "lib/dusts/insidemodal_button_dust"
            ], function (template) {
                _this.currUDG.GetData(_this.dataUrl, function (myData) {
                    me.currentData = myData;
                    dust.render("WebShop.dust", myData, function (error, output) {
                        if (error)
                            alert("Dust error: " + error);
                        var $hostDiv = $("#" + me.divID);
                        $hostDiv.empty();
                        $hostDiv.html(output);
                        var wnd = window;
                        var stripe = wnd.StripeCheckout;
                        var jq = $;
                        me.StripeHandler = stripe.configure({
                            key: 'pk_test_2hAYdv2ZKDPQ6XRKWfOIC8bT',
                            //key: 'pk_test_dHdbBJQgFiKRW2J8PSMUcvDt',
                            //image: '/square-image.png',
                            token: function (token, args) {
                                //console.log("Token: " + JSON.stringify(token));
                                //console.log("Args: " + JSON.stringify(args));
                                token.currentproduct = me.currentProduct;
                                me.currOPM.ExecuteOperationWithAjax("TheBall.Payments.ProcessPayment", token, function () {
                                    alert("Purchase succesful!");
                                }, function () {
                                    alert("Purchase failed!");
                                });
                            }
                        });
                        me.ControllerInitializeDone();
                    });
                });
            });
        };

        WebShopViewController.prototype.VisibleTemplateRender = function () {
        };

        WebShopViewController.prototype.InvisibleTemplateRender = function () {
        };

        WebShopViewController.prototype.OnlineSubscriptionCheckout = function ($source) {
            var jq = $;
            var currentEmail = jq.cookie("TheBall_EMAIL");
            var me = this;
            me.currentProduct = "ONLINE";
            me.StripeHandler.open({
                name: 'iZENZEi',
                image: "/about/assets/img/izenzei-logo.jpg",
                description: 'Online Taekwondo Monthly Subscription (TEST ONLY)',
                amount: 999,
                currency: "EUR",
                email: currentEmail,
                label: "Subscribe!"
            });
        };

        WebShopViewController.prototype.AllInclusiveSubscriptionCheckout = function ($source) {
            var jq = $;
            var currentEmail = jq.cookie("TheBall_EMAIL");
            var me = this;
            me.currentProduct = "ALLINCLUSIVE";
            me.StripeHandler.open({
                name: 'iZENZEi',
                image: "/about/assets/img/izenzei-logo.jpg",
                description: 'All Inclusive Monthly Subscription (TEST ONLY)',
                amount: 7500,
                currency: "EUR",
                email: currentEmail,
                label: "Subscribe!"
            });
        };
        return WebShopViewController;
    })(ViewControllerBase);

    
    return WebShopViewController;
});
