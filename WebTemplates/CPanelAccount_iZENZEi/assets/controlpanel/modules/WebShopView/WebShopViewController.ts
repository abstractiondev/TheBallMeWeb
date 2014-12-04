/**
 * Created by kalle on 3.6.2014.
 */


/// <reference path="../require.d.ts" />
/// <reference path="../dustjs-linkedin.d.ts" />
/// <reference path="../lodash.d.ts" />


import ViewControllerBase = require("../ViewControllerBase");

class WebShopViewController extends ViewControllerBase {

    StripeHandler:any;

    ControllerInitialize():void {
        var me = this;
        require(["WebShopView/WebShop_dust",
            "lib/dusts/command_button_begin_dust",
            "lib/dusts/command_button_end_dust",
            "lib/dusts/command_button_dust",
            "lib/dusts/modal_begin_dust",
            "lib/dusts/textinput_singleline_dust",
            "lib/dusts/modal_end_dust",
            "lib/dusts/hiddeninput_dust",
            "lib/dusts/openmodal_button_dust",
            "lib/dusts/insidemodal_button_dust"
        ], (template) => {
            this.currUDG.GetData(this.dataUrl, myData => {
                me.currentData = myData;
                dust.render("WebShop.dust", myData, (error, output) => {
                    if(error)
                        alert("Dust error: " + error);
                    var $hostDiv = $("#" + me.divID);
                    $hostDiv.empty();
                    $hostDiv.html(output);
                    var wnd:any = window;
                    var stripe:any = wnd.StripeCheckout;
                    var jq:any = $;
                    me.StripeHandler = stripe.configure({
                        key: 'pk_test_dHdbBJQgFiKRW2J8PSMUcvDt',
                        //image: '/square-image.png',
                        token: function(token, args) {
                            //console.log("Token: " + JSON.stringify(token));
                            //console.log("Args: " + JSON.stringify(args));
                            token.currentproduct = me.currentProduct;
                            me.currOPM.ExecuteOperationWithAjax("TheBall.Payments.ProcessPayment", token, function() {
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
    }

    // Instead of hidden fields in "form", we can store the last fetched data as current
    currentData:any;

    public VisibleTemplateRender():void {
    }

    public InvisibleTemplateRender():void {
    }

    currentProduct:string;

    OnlineSubscriptionCheckout($source) {
        var jq:any = $;
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
    }

    AllInclusiveSubscriptionCheckout($source) {
        var jq:any = $;
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
    }
}

export = WebShopViewController;