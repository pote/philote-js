# Philote.js

This is the client side library for [philote.io](https://philote.io).

## Usage

``` js
var hub = new Philote();

// Connect to a Hub.
hub.connect("SIGNED_CONNECTION_TOKEN", function() {
    // Optional callback executed when connected to the socket server.
});

// Tell the server to start sending events on the specified channels (in
// addition to any channels already subscribed to). This will internally
// generate an [authorization request](#authorization) against your server.
hub.subscribe("some-channel", "other-channel");

// Act on events from a specific channel. The channel must be a full channel
// name, not a pattern. You must `subscribe` to the channels as well.
hub.on("some-channel", function(data, event) {
    // `data` is a string with the raw body that was published.
});

// Send an event to all subscribers of the channel with the given data. `data`
// must be a string.
hub.publish("some-channel", "data");

// Tell the server to stop sending events for a list of channels.
hub.unsubscribe("some-channel", "other-channel");

// Close the connection.
hub.disconnect();
```

## Options

The following options can be passed to the `Philote` constructor:

``` js
{
    // Websockets server to connect to. Usually not something you will change.
    // `Philote.protocol` takes care of switching between `ws:` and `wss:` based
    // on whether the current page has been served over a secure connection or
    // not.
    server: (Philote.protocol + "//ws.philote.io/"),

    // Options relevant for requests made against your own app to authorize new
    // channel subscriptions.
    auth: {
        // Endpoint in your application to authorize subscriptions. Optional,
        // defaults to `/philote/auth`.
        endpoint: "/philote/auth",

        // How should we make authorization requests against your app. Valid
        // values are `ajax` and `jsonp`. Defaults to `ajax`.
        //
        // JSONP requests will include a `callback=Philote.JSONP` query
        // parameter.
        transport: "ajax",

        // Custom query parameters to send in the authorization request. Must be
        // a map[string, string].
        params: {},

        // Custom HTTP headers to send in the authorization request, when the
        // transport is `ajax`. Ignored if the transport is `jsonp`.
        headers: {},
    },

    // Handler for any errors at the service level (such as invalid connection
    // tokens).
    error: function(data, event) {},
}
```

## Authorization

When a user tries to join a channel, the library will make a GET request against
a URL you specify, with the following query parameters:

* `hub`: A hub identifier.
* `channels`: A comma separated list of URL-encoded channel patterns.
* If the transport is JSONP, a `callback` parameter with the `Philote.JSONP`
  value.
* Any other parameters specified in the `auth.params` key of the options passed
  to the Philote initializer.

It's left to the application to decide whether the user is allowed to listen to
events on the specified channels.

If the user is allowed, the app should respond with a `200 OK` response.
Otherwise, a `403 Forbidden` response is recommended (but any non-2xx status
code will be considered a failure to authorize).

The response should then be a JSON object with a single `"token"` key, which
maps to a new signed token.

## Best Practices

1. If you know the user will be subscribed to a list of channels right when
   connecting, then you should probably specify the list of channels when first
   generating a connection token in your server. This will ensure that you're
   subscribed automatically when you connect (you still need to call `on` to
   actually act on those events).

1. When subscribing to new channels, if you need to subscribe to more than one
   channel, make sure to pass all the channel names/patterns to a single
   invocation of `subscribe`, to reduce both the number of requests on your
   server and the "time to first message" on the newly subscribed channels.
