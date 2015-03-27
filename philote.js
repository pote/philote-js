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

    var Philote = function() {
    }

    Philote.prototype.connect = function(token) {
    }

    Philote.prototype.subscribe = function() {
    }

    Philote.prototype.unsubscribe = function() {
    }

    Philote.prototype.on = function(channel, callback) {
    }

    Philote.prototype.publish = function(channel, data) {
    }

    Philote.VERSION = "0.1.0";

    return Philote;
});

// vim: et sta sw=4
