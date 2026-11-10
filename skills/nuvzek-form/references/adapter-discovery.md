# UI Adapter Discovery

An adapter's existence proves basic integration, not knowledge of every component API. Do not invent universal native rules or component props.

## Discovery order

1. Read the target project's existing forms and setup.
2. Read the installed UI package version, component types, and source when needed.
3. If web access exists, consult official documentation matching that version.
4. If evidence remains insufficient, request a minimal working native form or the relevant documentation.

Record the inspected version and distinguish verified capabilities from assumptions.

## Required integration contract

A template supplies providers and either a built-in adapter ID, a custom adapter, or both:

```ts
{
  id: "custom",
  customAdapter: {
    formModelName: "model",
    formModelKey: "prop",
    validate: (runtime?: any) => runtime._render.formRef.value.validate(),
    resolveKeys: (componentProps) => null,
  },
  providers: {
    Form,
    FormItem,
    layouts: { Item, Group, List, ListItem },
  },
}
```

`customAdapter` can override part of a built-in adapter. Function-valued adapter properties receive the Runtime. Preserve this calling convention when implementing `validate` or `resolveKeys`. The current public `CustomAdapter.validate` type is declared as a no-argument function even though the implementation supplies Runtime; an optional annotated Runtime parameter, as above, satisfies both the current type and runtime behavior.

Check each boundary:

| Boundary | Required evidence or implementation |
| --- | --- |
| Form model property | `formModelName` |
| FormItem field-path property | `formModelKey` |
| Native validation | callback/Promise semantics and error result mapped by `validate` |
| Option labels and values | native mapping or `resolveKeys` for display collection |
| Input binding | Current Render supplies `modelValue` and `onUpdate:modelValue` |
| Rules | Native FormItem rules; Form only normalizes `required` |
| Events and slots | Native component signatures |
| Layouts | Item, Group, List, ListItem must implement default/add/delete slot contracts |
| SSR | String-to-component map and request/custom actions |

If a component uses `value`, `checked`, or another event instead of `modelValue`, create a small wrapper that converts it to `modelValue` and `update:modelValue`. A custom adapter alone cannot change the hardcoded input binding.

Do not modify the Form core merely to avoid a project-local wrapper unless the user requests a core change.

## Layout slot contracts

- Item and Group render their default slot.
- List renders `default` and an `add` slot. The add slot receives `{ render }`; attach the supplied click behavior to the rendered button.
- ListItem renders `default` and a `delete` slot with the same `{ render }` convention.

## Minimum smoke scenario

Before claiming initialization is complete, exercise:

1. Text input and model binding.
2. Select options and submission value.
3. Required validation and a native cross-field rule.
4. Conditional display after a model change.
5. List add/delete and relative field paths.
6. `submit()` success and validation failure.
7. SSR component resolution and requests when that mode is used.

Run the project's standard type check and build. Mark untested TreeSelect, display labels, slots, or other components explicitly instead of generalizing from the smoke result.
