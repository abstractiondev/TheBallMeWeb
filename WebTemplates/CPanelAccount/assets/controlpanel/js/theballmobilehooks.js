/**
 * Created by Kalle on 28.8.2015.
 */

if($) {
    $.ajaxSetup({
        beforeSend: function (x, settings) {
            if (window.TBJS2MobileBridge) {
                if (settings.type == "GET") {
                    if (x && x.overrideMimeType) {
                        x.overrideMimeType("application/json;charset=UTF-8");
                    }
                    return true;
                }
                var result = TBJS2MobileBridge.ExecuteAjaxOperation(settings.url, settings.data);
                if (result && settings.success) {
                    var data = JSON.parse(result);
                    settings.success(data.OperationResult);
                }
                return false;
            }
        }
    });
}
