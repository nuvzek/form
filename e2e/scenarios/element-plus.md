# Blank Vue + Element Plus E2E

Prepare an isolated target:

```sh
node e2e/prepare-blank.mjs /tmp/nuvzek-form-element-plus-e2e
```

Run the installed Skill against that target with one user-level request:

> In this blank Vue project, use Element Plus and @nuvzek/form to create an employee onboarding form. Include basic information, a list of work experiences, password confirmation, and a reason field that appears only when the application reason is other. Initialize everything needed and verify the result.

The agent must automatically:

1. Inspect the blank project and use its package manager.
2. Add Element Plus and `@nuvzek/form` without adding an unrelated framework.
3. Research the installed Element Plus version and implement `customAdapter`, providers, layouts, and any necessary wrappers.
4. Register `initForm` and the default template.
5. Generate the requested local TypeScript/TSX form and page integration.
6. Verify input binding, native required and cross-field validation, conditional display, list add/delete, and submit.
7. Run the target project's type check and standard build.

The run is complete only when the generated application builds and the requested interactions have been exercised. Any unverified behavior must be reported. Do not edit the original `packages/blank` fixture during the test.
