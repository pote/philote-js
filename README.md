# Philote.js

This is the client side library for [philote.io](https://philote.io).

## Usage

``` js
var ws = new Philote({ url: "ws://ws.example.com" });

ws.connect("PHILOTE_IDENTIFYING_TOKEN", function() {
    // Optional callback executed when connected to the socket server.
});

// Act on events from a specific channel.
ws.on("some-channel", function(data, event) {
    // `data` is a string with the raw body that was published.
});

// Send an event to all subscribers of the channel with the given data. `data`
// must be a string.
ws.publish("some-channel", "data");

// Close the connection.
ws.disconnect();
```

## Options

The following options can be passed to the `Philote` constructor:

``` js
{
    // Websockets server to connect to. Usually not something you will change.
    // `Philote.protocol` takes care of switching between `ws:` and `wss:` based
    // on whether the current page has been served over a secure connection or
    // not.
    url: ("ws://ws.philote.io/"),

    // Handler for any errors at the service level (such as invalid connection
    // tokens).
    error: function(data, event) {},
}
```

## Filters

Data sent and received in events *must* be strings. However, you will usually
want to make that structured in some way, because you tend to send more than a
single datum with each packet.

In order to accommodate this, Philote.js has the concept of filters. Filters are
functions that have a single parameter that can be composed to pre-process event
data before it's sent to the server, or received from the server.

For example, to pass arbitrary objects and have them serialize to/from JSON, you
would do this:

``` js
ws.filters.in.push(JSON.parse);
ws.filters.out.push(JSON.stringify);
```

With that in place, you can do this:

``` js
ws.on("channel", function(anObject) {
    // anObject has already been parsed from JSON here.
});

// Here the payload will be serialized into JSON before being sent over the wire
ws.publish("channel", { an: "object" });
```

You're welcome to add as many filters into the `in` and `out` queues.

## Authorization

When the websocket connection is opened, the Philote server will evaluate the client-supplied
identifying token and either subscribe the connection to the appropriate channels or simply
close it when the tokens are invalid.
