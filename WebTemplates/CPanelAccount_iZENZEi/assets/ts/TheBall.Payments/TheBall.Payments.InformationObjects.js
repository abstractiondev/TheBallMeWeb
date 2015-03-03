/**
* Created by Kalle on 1.3.2015.
*/
/// <reference path="../../controlpanel/modules/jquery.d.ts" />
var GroupSubscriptionPlan = (function () {
    function GroupSubscriptionPlan(planName, description, groupIDs, price, additionalData) {
        this.PlanName = planName;
        this.Description = description;
        this.GroupIDs = groupIDs;
        this.Price = price;

        $.extend(this, additionalData);
        var jq = $;
        var priceObject = {
            PriceAsFormattedText: jq.formatNumber(this.Price, {
                format: "# ###.00"
            })
        };
        $.extend(this, priceObject);
    }
    return GroupSubscriptionPlan;
})();
