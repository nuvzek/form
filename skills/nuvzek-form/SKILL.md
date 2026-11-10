---
name: nuvzek-form
description: Create, integrate, modify, and validate Vue forms with @nuvzek/form. Use for form generation, Schema or dispatch authoring, UI-library initialization and adapters, field linkage, validation, hydration, lists, display values, and server-driven form JSON.
license: MIT
compatibility: Requires a Vue 3.5+ project. Node.js is required for bundled scripts. Network access is optional when researching an unfamiliar UI library.
metadata:
  author: nuvzek
  version: "0.1.0"
---

# Nuvzek Form

Deliver a working form in the user's project, not merely an isolated snippet. Treat `init`, `adapter`, `create`, and `validate` as internal workflows; the user only needs to describe the desired outcome. Advanced users may explicitly request one workflow.

## 1. Understand before asking

Inspect the target files and project first. Infer reasonable fields, components, layout, and required rules from the request. Do not begin with a questionnaire.

Ask at most one to three questions only when an answer changes data correctness or the implementation target, such as local TS versus remote JSON when the project gives no indication, an incompatible Vue version, or an external API contract required by requested behavior. Otherwise proceed and report assumptions.

Images may guide fields, grouping, order, and layout. Do not infer unseen API contracts or validation behavior from an image.

## 2. Ensure the project is ready automatically

1. Detect the package manager from `packageManager` and lockfiles. Use the existing manager.
2. Confirm Vue compatibility. `@nuvzek/form` requires Vue `^3.5.13`; do not claim Vue 2 compatibility. In a Vue 3 project, interpret “Element UI” as Element Plus when context supports that meaning and state the assumption.
3. Locate existing `initForm`, `defineFormSetup`, templates, custom adapters, wrappers, layouts, SSR component maps, and form examples. Preserve user customizations.
4. If the user explicitly selects a missing UI library, adding it is part of the requested integration. Otherwise do not introduce an unrelated UI dependency.
5. Reuse complete setup, complete partial setup, and create missing setup. Initialization must be idempotent.
6. For an unfamiliar UI library, follow [adapter-discovery](references/adapter-discovery.md). Prefer installed source/types and project usage over web examples. Use version-matched official documentation when web access exists. If no research capability exists, continue with local evidence and request a minimal native example only when blocked.

Do not stop to tell the user to run an `init` command. Complete required initialization as part of form creation.

## 3. Choose the Schema mode

- Default to local TypeScript/TSX for a page or component in a Vue project.
- Use serializable SSR JSON when the user requests JSON, server-driven schemas, or the existing host already uses `ssr`.
- Never mix imported component objects with string components in one mode, and never put functions, JSX, `raw()`, or `once()` into JSON.

Read [local-schema](references/local-schema.md) or [ssr-schema](references/ssr-schema.md) before generating the corresponding mode. Read [dispatch](references/dispatch.md) for any remote request, condition, event pipeline, state mutation, ref call, or `I18N` action.

## 4. Generate native integrations

Form does not define a universal validation-rule DSL. `required` is normalized by Form, but other `rules`, component props, events, and slots follow the selected UI library.

For cross-field rules, combine Form's reactive Schema function with the target UI library's native validator signature. Never copy a validator between UI libraries without checking its contract.

Verification-code and similar requests include more than fields and rules: account for native layout, sending, pending state, countdown, errors, cleanup, and the supplied API. If no API exists, implement the UI structure without inventing a request and identify the remaining host integration.

Use the smallest project-conventional implementation. Avoid unrelated refactoring and universal abstraction layers.

## 5. Verify the deliverable

1. For SSR JSON, run the bundled validator using its resolved skill-directory path:

   ```sh
   node <skill-directory>/scripts/validate-ssr-schema.mjs <schema.json>
   ```

   Use `--json` for machine-readable results. Errors must be fixed; warnings about custom actions require checking host registration.
2. For local TS/TSX, run the target project's type checking and standard build. JSON validation is not a substitute for component and validator typing.
3. Exercise the real form or Runtime for requested behavior: model initialization, input binding, validation, conditional display, list add/delete, hydration, and submission as applicable.
4. Wait for asynchronous SSR conditions and requests; do not assert their intermediate `undefined` state as the final result.
5. Do not claim unverified UI-library or component support. Report exactly what was checked.

Use [runtime-api](references/runtime-api.md) for submission, hydration, shared state, display values, and form replacement. Use [review-checklist](references/review-checklist.md) before finishing.

## 6. Response contract

Report the files changed, initialization or adapter work performed, verification commands and results, business assumptions, and any host-provided API or custom action still required. Keep the summary concise and do not present a partial integration as complete.
