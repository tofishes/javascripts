// @author tofishes
// @date 2013.4.26
// @version 1.0
(function (win) {
    var util = {
        // 转换jquery对象，dom对象为字符串
        convertToHtmlString: function (source) {
            if (source.jquery) source = source[0];
            return source.outerHTML || source;
        }
    };
    win.tofishesUtil = util;
})(window)
