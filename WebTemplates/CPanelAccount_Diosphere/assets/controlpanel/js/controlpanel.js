/**
 * Created by kalle on 12.2.2014.
 */

String.prototype.replaceAll = function(strReplace, strWith) {
    var reg = new RegExp(strReplace, 'ig');
    return this.replace(reg, strWith);
};

