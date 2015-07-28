/**
* Created by Kalle on 1.3.2015.
*/
/// <reference path="../controlpanel/modules/jquery.d.ts" />
/// <reference path="../controlpanel/modules/lodash.d.ts" />
/// <reference path="../ts/TheBall.Payments/TheBall.Payments.InformationObjects.ts" />
var ConstantsClass = (function () {
    function ConstantsClass() {
        this.StripeTestUserEmails = [
            "theballdemo@gmail.com"
        ];
        window.console.log("Constants Initializing...");
        this.IsStripeTestUser = this.getIsStripeTestUser();

        this.ActivePlans = [
            new GroupSubscriptionPlan("ONLINE", "Online Taekwondo", ["b22f0329-34f8-433d-bc44-b689627468cc"], 14.90, {
                IsAvailable: true,
                IsActive: false
            }),
            new GroupSubscriptionPlan("ALLINCLUSIVE", "All Inclusive", ["NOT_ACTIVE_YET"], 74.90, {
                IsAvailable: false,
                IsActive: false
            })
        ];
    }
    ConstantsClass.prototype.getIsStripeTestUser = function () {
        var jq = $;
        var currentEmail = jq.cookie("TheBall_EMAIL");
        var result = _.contains(this.StripeTestUserEmails, currentEmail);
        window.console.log("IsStripeTestUser: " + currentEmail + "? " + result);
        return result;
    };
    return ConstantsClass;
})();

var Constants = new ConstantsClass();
