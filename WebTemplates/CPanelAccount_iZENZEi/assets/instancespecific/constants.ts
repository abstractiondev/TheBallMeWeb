/**
 * Created by Kalle on 1.3.2015.
 */


/// <reference path="../controlpanel/modules/jquery.d.ts" />
/// <reference path="../controlpanel/modules/lodash.d.ts" />
/// <reference path="../ts/TheBall.Payments/TheBall.Payments.InformationObjects.ts" />

class ConstantsClass {
    public StripeTestUserEmails:string[] = [
        "theballdemo@gmail.com",
        //"sarianneraman@gmail.com",
        //"olga.ranta@me.com",
    ];
    public IsStripeTestUser:boolean;
    public ActivePlans:GroupSubscriptionPlan[];

    private getIsStripeTestUser() {
        var jq:any = $;
        var currentEmail = jq.cookie("TheBall_EMAIL");
        var result = _.contains(this.StripeTestUserEmails, currentEmail);
        window.console.log("IsStripeTestUser: " + currentEmail + "? " + result);
        return result;
    }

    constructor() {
        window.console.log("Constants Initializing...");
        this.IsStripeTestUser = this.getIsStripeTestUser();

        this.ActivePlans = [
            //new GroupSubscriptionPlan("ONLINE", "Online Taekwondo", ["1b466a35-49ad-4608-949a-a1b029dc87f4"], 14.90, {
            new GroupSubscriptionPlan("ONLINE", "Online Taekwondo", ["b22f0329-34f8-433d-bc44-b689627468cc"], 14.90, {
                IsAvailable:true,
                IsActive:false
            }),
            new GroupSubscriptionPlan("ALLINCLUSIVE", "All Inclusive", ["NOT_ACTIVE_YET"], 74.90, {
                IsAvailable:false,
                IsActive:false
            })
        ] ;
    }
    /*

     {
     ONLINE: {
     Groups: [ "e710a1f8-94a3-4d38-85df-193936624ce4" ],
     IsAvailable: true,
     IsActive: false
     },
     ALLINCLUSIVE: {
     Groups: [ "" ],
     IsAvailable: false,
     IsActive: false
     }
     };

     */
}

var Constants = new ConstantsClass();



