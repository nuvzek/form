# form

A vue form builder.

## Form Skill

The portable Agent Skill lives in `skills/nuvzek-form/`. It supports automatic project initialization, UI-library adaptation, local TS/TSX forms, serializable SSR Schema, and validation.

For Kimi Code, install the repository as a plugin:

```text
/plugins install https://github.com/nuvzek/form
/reload
```

Other Agent Skills-compatible clients can copy or link `skills/nuvzek-form/` into their supported skill directory. The core Skill uses only standard metadata and relative resources.

Run the Skill tests with `pnpm test:skill`. Prepare an isolated blank Vue project for end-to-end verification with:

```sh
node e2e/prepare-blank.mjs /tmp/nuvzek-form-e2e
```

See `e2e/scenarios/element-plus.md` for the full unknown-UI-library scenario.