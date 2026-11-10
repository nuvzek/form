# Local TypeScript/TSX Schema

Use local Schema for project pages and components. Import real Vue components and pass them as `component`; string component names belong to SSR mode.

## Setup

Register the plugin before mounting and load setup asynchronously:

```ts
import { createApp } from "vue";
import { initForm } from "@nuvzek/form";
import App from "./App.vue";

const app = createApp(App);
app.use(initForm, {
  loader: () => import("./form-setup"),
  env: "web",
});
app.mount("#app");
```

A setup selects a template and supplies Form, FormItem, and all four layouts:

```ts
import { defineFormSetup } from "@nuvzek/form";

export default defineFormSetup({
  templates: [
    {
      id: "basic",
      adapter: "ArcoVue",
      providers: { Form, FormItem, layouts: { Item, Group, List, ListItem } },
    },
  ],
  default: { templateId: "basic" },
});
```

Built-in adapter IDs are `ArcoVue`, `NaiveUI`, and `NutUI`. Other libraries need `customAdapter`; see `adapter-discovery.md`.

## Nodes

```ts
import { Input, Select } from "@arco-design/web-vue";
import { defineFormSchema } from "@nuvzek/form";

export default defineFormSchema([
  { component: Input, field: "name", label: "姓名", required: true },
  {
    component: Select,
    field: "profile.department",
    label: "部门",
    componentProps: {
      options: [{ label: "研发部", value: "rd" }],
    },
  },
  {
    type: "group",
    label: "分组标题",
    span: 12,
    children: [
      { component: Input, field: "phone", label: "手机号" },
    ],
  },
  {
    type: "list",
    field: "contacts",
    minLen: 1,
    children: [
      { component: Input, field: "name", label: "联系人" },
    ],
  },
]);
```

- `item` is the default type. `field` may be omitted for display-only components.
- `group` organizes children without adding a model path.
- `list` owns an array field. Child fields are relative: `name`, not `contacts.name`.
- `defaultValue` initializes the model. Lists default to an empty array when no explicit value is supplied.
- `span` uses a 24-column layout. `layoutGap` and `listLayoutGap` control spacing.
- `formItemProps`, `formItemSlots`, `componentProps`, and `componentSlots` pass native capabilities through.

## Dynamic values

Any Schema property may be a synchronous or asynchronous function:

```ts
{
  component: Input,
  field: "otherReason",
  label: "其他原因",
  show: ({ model }) => model.reason === "other",
  componentProps: {
    disabled: ({ shared }) => shared.readonly,
  },
}
```

Functions receive `model`, `shared`, `share`, `refs`, and `locale`. Reads of `model`, `shared`, and `locale` are tracked and reevaluated when dependencies change. Async properties temporarily produce `undefined` until resolved. Raw Schema types are currently permissive and do not contextually type these functions; in strict projects, explicitly annotate destructured utilities and native validator parameters.

Wrap event handlers with `raw`; the first argument is utilities, followed by native event arguments:

```ts
import { raw } from "@nuvzek/form";

componentProps: {
  onChange: raw((utils, value) => {
    utils.share({ selected: value });
  }),
}
```

Use `once(fn)` to calculate without registering ongoing dependencies. `raw(object)` also prevents deep parsing of objects such as function-based `lookup` configuration.

## Validation

`required: true` creates a native required rule with localized text. `required: "message"` customizes it. Additional rules remain UI-library native:

```ts
rules: ({ model }) => [
  {
    validator: (value, callback) => {
      if (value !== model.password) callback("两次密码不一致");
      else callback();
    },
  },
],
```

This example is Arco-specific. Check the selected library before using it elsewhere. Hidden fields are not automatically removed from the model; clear them explicitly when required by the business semantics.

## Reference assets

- `assets/local-basic.tsx`: static fields and a list.
- `assets/local-dependent.tsx`: dynamic visibility, native events, and cross-field validation.
