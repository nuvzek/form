# SSR Dispatch

Default markers are `$dispatch`, `$model`, `$shared`, `$res`, `$err`, and `$args`. Hosts may rename them through `ssr.definitions`.

## Requests

```json
{
  "$dispatch": "GET",
  "target": "/api/departments",
  "path": "data",
  "params": { "keyword": "$model.keyword" },
  "transform": {
    "method": "map",
    "relation": { "id": "value", "name": "label" }
  },
  "then": { "$dispatch": "SET_SHARED", "field": "departments", "as": "$res.data" },
  "catch": { "$dispatch": "SET_SHARED", "field": "error", "as": "$err.message" }
}
```

- Methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.
- `path` extracts from the raw host response with lodash.get syntax.
- `transform.map` copies renamed fields onto each item; it does not remove original fields.
- `then` runs after `path` and `transform`; `$res.data` reads the `data` property of that processed result. Bare `$res` remains a string.
- Request `data` is the body; `params` is the query object. Actual HTTP behavior belongs to `ssr.actions`.
- Missing request actions throw an explicit error. With `strict: true`, `transform.map` throws when the extracted response is not an array; without it, the previous lenient behavior is preserved.

## Conditions

```json
{
  "$dispatch": "CONDITION",
  "op": "gt",
  "left": "$model.amount",
  "right": 5000,
  "then": true,
  "else": false
}
```

Operators implemented by the runtime:

- Equality/comparison: `eq`, `ne`, `gt`, `ge`, `gte`, `lt`, `le`, `lte`.
- Multiple values: `between`, `not_between`, `in`, `not_in`.
- String matching: `like`, `not_like`, `like_left`, `not_like_left`, `like_right`, `not_like_right`.

Use `and` or `or` arrays for composition. Conditions are asynchronous and await Vue's next tick; reactive effects may transiently set the target property to `undefined` before the final value.

## Events and state

```json
{
  "$dispatch": "EVENT_HANDLER",
  "pipes": [
    { "$dispatch": "SET_MODEL", "field": "city", "as": "" },
    {
      "$dispatch": "SET_SHARED",
      "field": "cityOptions",
      "as": {
        "$dispatch": "GET",
        "target": "/api/cities",
        "path": "data",
        "params": { "province": "$args.0" }
      }
    }
  ]
}
```

- Use `$args.0` for the first native event argument, usually the newly selected value.
- `SET_MODEL` and `SET_SHARED` require `field` and `as`. When `as` is a dispatch object, its result is assigned.
- `GET_MODEL` and `GET_SHARED` read `field`.
- An event with one action can use that action directly without `EVENT_HANDLER`.
- Actions in a pipeline are initiated in order, but event-handler pipes are not awaited as a sequential transaction; avoid hidden dependencies between asynchronous pipes.

## Refs and custom actions

```json
{ "$dispatch": "REFS", "field": "counter", "call": "increment", "args": [] }
{ "$dispatch": "REFS", "field": "counter", "get": "theRemark" }
```

Custom actions such as `ALERT` must exactly match a function registered in `ssr.actions`. Each top-level input property is processed for dispatches or dynamic values before the action is called. Do not assume arbitrary nested plain objects are recursively evaluated; use explicit dispatches or handle deep custom structures in the host action.

## Internationalization

```json
{
  "$dispatch": "I18N",
  "values": {
    "zh-CN": [{ "label": "男", "value": "male" }],
    "en-US": [{ "label": "Male", "value": "male" }]
  }
}
```

Selected branches may contain further dispatches or dynamic values.
