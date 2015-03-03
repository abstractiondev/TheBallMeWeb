/**
 * Created by Kalle on 1.3.2015.
 */

/// <reference path="../../controlpanel/modules/jquery.d.ts" />


class GroupSubscriptionPlan {
    public PlanName:string;
    public Description:string;
    public GroupIDs:string[];
    public Price:number;

    constructor(planName:string, description:string, groupIDs:string[], price:number, additionalData:any) {
        this.PlanName = planName;
        this.Description = description;
        this.GroupIDs = groupIDs;
        this.Price = price;

        $.extend(this, additionalData);
        var jq:any = $;
        var priceObject:any = {
            PriceAsFormattedText: jq.formatNumber(this.Price,
                {
                    format:"# ###.00"
                })
        };
        $.extend(this, priceObject);
    }
}


