# Runtime API

## `useForm(options)`

Important options:

- `schemas`: an array, a function returning an array, or a function returning a Promise of an array.
- `templateId`: overrides the setup default template.
- `formProps`, `formSlots`: native Form configuration and slots.
- `layoutGap`, `listLayoutGap`: spacing overrides.
- `ssr`: string component resolution, dispatch actions, and marker definitions.
- `namesToRemember`: recursively rename model keys on submit and reverse them on hydrate.
- `collectDisplayValues`: include labels/display entries in submission.
- `noAutoLookup`: disable automatic lookup processing.
- `locale`, `localeMap`, `fallbackLocale`, `messages`: internationalization.

The returned tuple contains the Vue Form component and controls:

```ts
const [Form, {
  submit,
  share,
  model,
  schemas,
  isReady,
  hydrate,
  getFormRef,
  getLookupResults,
  triggerLookup,
  updateForm,
  locale,
}] = useForm(options);
```

## Initialization and hydration

`model` is a ref containing the current model. `schemas` is the parsed Schema ref, not the original input. `isReady(callback)` waits until field/default-value relations are consumed.

`hydrate(data)` itself waits for readiness and merges top-level keys into the model. Use it for existing-record editing. When `namesToRemember` is enabled, supply remembered names to `hydrate`; hydration converts them to internal names, and submission converts internal names back to remembered names.

## Submission

`submit()` calls the active adapter's `validate()` and rejects on validation failure.

Without display collection:

```ts
const result = await submit();
```

With `collectDisplayValues: true`:

```ts
const { result, displayValues } = await submit();
```

Display values are collected from component options, adapter key mappings, or a component's exposed `getDisplayValue()`. Tree labels support `labelMode: "leaf" | "path" | "parent"`.

## Shared state

`share(object)` merges values into the instance's shared object. Schema functions read it through `utils.shared`; SSR uses `$shared` or shared dispatches. State is per form Runtime.

## Lookup

`lookup` records field-level display matches and deletion handlers. `getLookupResults()` returns a computed collection; `getLookupResults(path)` returns one entry. `triggerLookup()` recalculates all registered lookups. Prefer submission-time `collectDisplayValues` when no interactive lookup UI is needed.

## Replacement and refs

`updateForm(options)` merges options, replaces schemas, and resets model, effects, shared state, lookups, refs, and parsed schemas. It is appropriate for AI preview and remote editor application. Do not assume old model values survive.

`getFormRef()` exposes the native Form ref. `deleteField` exists on Runtime but is not exposed through the `useForm` controls; lookup result deletion handlers use it internally.
