// @author tofishes
// @date 2013年4月1日
// @version 1.0
// 操作WebSocket的小型帮助工具
// 默认约定： 前后端传输数据格式为json, json中必须有event_type来表示事件类型，
// 然后new Socket()可以使用 .on('event_type', function(data) {}) 来自动处理
// 也提供了自定义数据格式解析和获取event_type的参数
// 示例:
// var socket = new Socket({
//      url: '', // 后端链接地址
//      protocal: '', // 子协议，意义和原生WebSocket接口一样, 可省略。
//      
//      parseData: function(data) {}, // 如需自定义传输数据格式，这里需要写上自己的处理方法
//      getEventType: function(data) {}, // 解析数据后，此方法用来获取到event_type
//      pingContent: null, // 设置ping发送的内容，保持与服务器的连接
//      pingInterval: 60 // 设置自动ping的时间间隔，单位秒，默认60秒
// });
// // 原生事件的写法
// socket.on('open', function() {})
// socket.on('message', function(data) {}) // 传入解析后的数据
// socket.on('close', function() {})
// socket.on('error', function() {})
// // 自定义事件
// // 按约定触发new_message，需返回数据为JSON: {'event_type': 'new_message', ...}
// socket.on('new_message', function() {})
// // 按约定触发post-user，需返回数据为JSON: {'event_type': 'post-user', ...}
// socket.on('post-user', function() {})
// 最后，调用socket.open(url)打开一个连接，这里的url可选，将覆盖new时候的参数rul
// 如果设置了pingContent
;(function (window) {
    var pingTimeoutId;
    function Socket(options) {
        this.url = options.url;
        this.protocal = options.protocal;
        this.socket = null;
        this.originalEvents = [
            'open',
            'close',
            'message',
            'error'
        ];

        // 以下参数涉及到自定义内容
        this.pingContent = null;  // 自动ping服务器发送的信息，保持连接用的，信息为null则不自动ping
        this.pingInterval = 60; // ping的时间间隔，默认60秒，单位秒

        // 如何解析后端数据，默认解析为JSON
        this.parseData = options.parseData || function (data) {
            return JSON.parse(data);
        };
        // 根据解析后数据，获取需要执行的事件类型, 默认获取JSON的event_type key
        this.getEventType = options.getEventType || function (data) {
            return data.event_type;
        };

        // 去除目前比较鸡肋的，实现有误的重连功能
        // 断开重连的间隔时间, 默认10秒
        // this.tryInterval = 10000;
        // 断开重连的尝试次数
        // this.tryTimes = 20;
        this.events = {};
    };
    // 开启一个socket连接，并绑定各事件处理
    // 可选 传url参数，会覆盖new Socket时候设置的options.url
    Socket.prototype.open = function(url) {
        var _this = this;
        this.url = url || this.url;

        this.socket = this.protocal ? new WebSocket(this.url, this.protocal) : new WebSocket(this.url);
        var events = this.events, oe = this.originalEvents;

        for (var i = 0, eventName; i < oe.length; i ++) {
            eventName = oe[i];
            //循环去绑定原生事件的处理, 对message额外处理
            (function(eventName) {
                _this.socket['on' + eventName] = function () {
                    // 自定义事件的触发
                    if (eventName === 'message') {
                        var data = _this.parseData(arguments[0].data);
                        arguments[0] = data;
                        var event_type = _this.getEventType(data);
                        if (event_type && events[event_type]) {
                            events[event_type].call(this, data);
                        }
                    }
                    events[eventName] && events[eventName].apply(this, arguments);
                }
            })(eventName);
        };
        // 设置自动ping
        if (this.pingContent !== null)
            this.ping(this.pingContent);

        return this;
    };
    Socket.prototype.on = function(type, action) {
        this.events[type] = action;
        return this;
    };
    // 可以对原生的做状态判断
    Socket.prototype.send = function (data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN)
            this.socket.send(data);

        return this;
    };
    Socket.prototype.close = function () {
        this.socket && this.socket.close();

        return this;
    };
    // 对原生webScoket接口ping的扩展，定时ping
    Socket.protocal.ping = function (pingContent) {
        pingContent = pingContent || this.pingContent;
        var socket = this;
        window.clearTimeout(pingTimeoutId);
        pingTimeoutId = setTimeout(function () {
            socket.send(pingContent);
            socket.ping(pingContent)
        }, this.pingInterval * 1000);
    };
    
    window.Socket = Socket;
})(window);