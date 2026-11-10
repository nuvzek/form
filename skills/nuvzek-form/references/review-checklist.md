# Review Checklist

## Request and project

- The requested page, Schema file, or integration target was actually changed.
- Existing package manager, Vue version, template, UI library, and project conventions were preserved.
- Missing initialization was completed automatically without overwriting user customizations.
- Business assumptions are limited and reported.

## Schema

- Local and SSR modes are not mixed.
- Groups do not introduce unintended model nesting.
- List children use relative fields and list defaults/addition are initialized.
- Required fields and native validation match the selected UI library.
- Conditional hiding does not accidentally imply data deletion.
- No endpoint, component mapping, event signature, or custom action was invented.

## SSR

- The root is an array and all item components are strings.
- No functions or JSX appear in JSON.
- Requests include real supplied targets and correct `path`/`params`/`data`.
- `$res`, `$err`, and `$args` include concrete paths; event values use `$args.0`.
- Built-in dispatch shapes are valid and custom actions are registered.
- The bundled validator reports no errors.

## Native UI integration

- Adapter model and field keys match the Form and FormItem.
- `validate()` matches native callback or Promise behavior.
- Components follow `modelValue` binding or have wrappers.
- Rules, props, events, and slots were checked against the installed UI version.
- All four layouts and their add/delete slot contracts work.

## Verification

- Target type check and standard build pass, or failures are reported precisely.
- Requested interactions were exercised through real UI or Runtime calls.
- Async initialization, requests, and conditions were awaited to their final state.
- Submit success and relevant validation failure were checked.
- Unsupported or unverified behavior is explicitly listed rather than implied to work.
