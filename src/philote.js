(function(name, context, definition) {
    if (typeof module != 'undefined' && module.exports) {
        module.exports = definition();
    } else if (typeof define == 'function' && define.amd) {
        define(definition);
    } else {
        context[name] = definition();
    }
})("Philote", this, function() {
    "use strict";

    // Internal: Wrap a callback around a specific context.
    function wrap(ctx, fn) {
        return function() {
            return fn.apply(ctx, arguments);
        }
    }

    var protocol = (location.protocol === "https:") ? "wss:" : "ws:";

    var defaultOptions = {
        server: protocol + "//ws.philote.io/",
        auth: {
            endpoint: "/philote/auth",
            transport: "ajax",
            params: {},
            headers: {}
        },
        error: function() {}
    }

    var Philote = function(options) {
        if (this === this.window) {
            throw new Error("Need to instantiate via `new Philote`");
        }

        var options = options || {};
        var auth = options.auth || {};

        this.options = {
            server: options.server || defaultOptions.server,
            auth: {
                endpoint: auth.endpoint || defaultOptions.auth.endpoint,
                transport: auth.transport || defaultOptions.auth.transport,
                params: auth.params || defaultOptions.auth.params,
                headers: auth.headers || defaultOptions.auth.headers
            },
            error: options.error || defaultOptions.error
        }

        this.handlers = {};
        this.sendQueue = [];
        this.filters = { in: [], out: [] };
    }

    // Expose this so that users can easily use custom URLs.
    Philote.protocol = protocol;

    Philote.prototype.connect = function(token, callback) {
        var url = this.options.server + "?token=" + encodeURIComponent(token);
        this.socket = new WebSocket(url);

        this.socket.onopen = wrap(this, function() {
            if (typeof callback === "function")
                callback();

            while (this.sendQueue.length > 0) {
                this.publish.apply(this, this.sendQueue.shift());
            }
        });

        this.socket.onmessage = wrap(this, onMessage);
    }

    Philote.prototype.disconnect = function() {
        if (this.socket)
            this.socket.close();
    }

    Philote.prototype.subscribe = function() {
        console.log("Unimplemented yet...");
    }

    Philote.prototype.unsubscribe = function() {
        console.log("Unimplemented yet...");
    }

    Philote.prototype.on = function(channel, callback) {
        if (typeof callback !== "function") {
            throw new Error("The callback must be a function");
        }

        this.handlers[channel] = this.handlers[channel] || [];
        this.handlers[channel].push(callback);
    }

    function onMessage(event) {
        var event = JSON.parse(event.data);

        if ("error" in event) {
            this.options.error(event);
            return;
        }

        var handlers = this.handlers[event.channel];

        if (!handlers || handlers.length === 0)
            return;

        var payload = applyFilters(event.data, this.filters.in);

        for (var i = 0; i < handlers.length; ++i) {
            handlers[i](payload, event);
        }
    }

    Philote.prototype.publish = function(channel, data) {
        if (!this.socket || this.socket.readyState === 0) {
            this.sendQueue.push([channel, data]);
        } else if (this.socket.readyState === 1) {
            data = applyFilters(data, this.filters.out);
            var payload = JSON.stringify({ channel: channel, data: data });
            this.socket.send(payload);
        } else if (this.socket.readyState > 1) {
            throw new Error("Can't publish data after disconnecting!");
        }
    }

    function applyFilters(unfilteredData, filterChain) {
        return filterChain.reduce(function(data, filter) {
            return filter(data);
        }, unfilteredData);
    }

    Philote.VERSION = "@VERSION@";

    return Philote;
});

// vim: et sta sw=4
