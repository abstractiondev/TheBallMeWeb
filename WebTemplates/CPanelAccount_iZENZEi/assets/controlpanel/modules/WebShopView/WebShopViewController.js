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
                            key: 'pk_test_CXbPmaZOvtu7jpuToB9z9wWh',
                            //key: 'pk_test_2hAYdv2ZKDPQ6XRKWfOIC8bT',
                            //key: 'pk_test_dHdbBJQgFiKRW2J8PSMUcvDt',
                            //image: '/square-image.png',
                            token: function (token, args) {
                                //console.log("Token: " + JSON.stringify(token));
                                //console.log("Args: " + JSON.stringify(args));
                                token.currentproduct = me.currentProduct;
                                me.currOPM.ExecuteOperationWithAjax("TheBall.Payments.ActivateAndPayGroupSubscriptionPlan", token, function () {
                                    alert("Purchase succesful!");
                                }, function () {
                                    alert("Purchase failed!");
                                });
                            }
                        });
                        var $container = $(".isotope-subscription-container");
                        $container.isotope({ itemSelector: ".isotope-subscription-item", layoutMode: "fitRows" });
                        me.ControllerInitializeDone();
                    });
                });
            });
        };

        WebShopViewController.prototype.getCurrentPlan = function (planName) {
            var me = this;
            return _.find(me.currentData.Plans, function (plan) {
                return plan.PlanName == planName;
            });
        };

        WebShopViewController.prototype.VisibleTemplateRender = function () {
        };

        WebShopViewController.prototype.InvisibleTemplateRender = function () {
        };

        WebShopViewController.prototype.CancelSubscription = function ($source) {
            var me = this;
            var jq = $;
            var currentEmail = jq.cookie("TheBall_EMAIL");
            var command_args = $source.attr("data-oip-command-args");
            var planName = command_args;
            var plan = me.getCurrentPlan(planName);
            var me = this;
            me.currOPM.ExecuteOperationWithAjax("TheBall.Payments.CancelGroupSubscriptionPlan", { PlanName: planName }, function () {
                alert("Cancelling succesful!");
            }, function () {
                alert("Cancelling failed!");
            });
        };

        WebShopViewController.prototype.ActivateSubscription = function ($source) {
            var me = this;
            var jq = $;
            var currentEmail = jq.cookie("TheBall_EMAIL");
            var command_args = $source.attr("data-oip-command-args");
            var planName = command_args;
            var plan = me.getCurrentPlan(planName);
            var me = this;
            var stripeProductName = "Subscription Plan - " + planName;
            me.currentProduct = plan.PlanName;
            var stripePrice = plan.Price * 100;
            me.StripeHandler.open({
                name: stripeProductName,
                image: "/about/assets/img/izenzei-logo.jpg",
                description: plan.Description,
                "billing-address": "true",
                amount: stripePrice,
                currency: "EUR",
                email: currentEmail,
                label: "Activate Subscription!"
            });
        };
        return WebShopViewController;
    })(ViewControllerBase);

    
    return WebShopViewController;
});
