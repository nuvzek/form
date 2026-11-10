# Serializable SSR JSON Schema

Use this mode for server-delivered or editor-consumed Schema. “SSR” here means the serializable dispatch runtime, not only server-rendered HTML.

## Host setup

Components are strings resolved by the host:

```ts
const ssr = {
  async renderComponent(name) {
    const components = await import("@arco-design/web-vue");
    return { ...components, ...customComponents }[name];
  },
  actions: {
    GET: ({ target, params }) => http.get(target, { params }),
    POST: ({ target, data }) => http.post(target, data),
  },
};

const [Form, controls] = useForm({ schemas, ssr });
```

Every string component and custom dispatch action must have a host mapping. Built-in dispatch actions still need their corresponding host action for requests.

## Schema contract

```json
[
  {
    "component": "Input",
    "field": "name",
    "label": "姓名",
    "required": true
  },
  {
    "type": "group",
    "label": "详情",
    "children": [
      {
        "component": "Select",
        "field": "department",
        "label": "部门",
        "componentProps": {
          "options": [{ "label": "研发部", "value": "rd" }]
        }
      }
    ]
  },
  {
    "type": "list",
    "field": "items",
    "minLen": 1,
    "children": [
      { "component": "Input", "field": "name", "label": "名称" }
    ]
  }
]
```

- Root is an array; nodes are `item` (default), `group`, or `list`.
- SSR item components are non-empty strings. Display-only items may omit `field`.
- Group children share the current model scope. List children use relative fields.
- JSON cannot contain functions, JSX, `raw()`, `once()`, or native validator closures. Use declarative native rules supported by the host, a host-registered action, or local TS for arbitrary validation.
- Do not invent API endpoints. Use static options when no endpoint is supplied.

## Internationalization

`label`, `placeholder`, and `required` accept locale dictionaries directly:

```json
{
  "component": "Input",
  "field": "name",
  "label": { "zh-CN": "姓名", "en-US": "Name" },
  "required": true
}
```

For other values, use an `I18N` dispatch. Built-in locales are `zh-CN`, `en-US`, and `zh-HK`; hosts can supply `locale`, `localeMap`, `fallbackLocale`, and `messages`. Read `i18n.md` for reactive switching, fallback rules, custom messages, and verification. See `assets/ssr-i18n.json` for a complete example.

## Display values

With `collectDisplayValues: true`, `submit()` returns `{ result, displayValues }`. For option trees, `labelMode` supports `leaf`, `path`, and `parent`. Custom components can expose `getDisplayValue()`; the exported `useFormDisplayValue` helper simplifies this integration.

## Validation script

Run the bundled `scripts/validate-ssr-schema.mjs` before applying JSON. It checks structure, List paths, built-in dispatch contracts, dynamic references, and JSON syntax. Unknown dispatch actions produce warnings because hosts may register them; they are not automatically errors.

See `assets/ssr-basic.json` and `assets/ssr-linked.json` for complete examples.
