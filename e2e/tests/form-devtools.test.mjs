import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { FormContext, initForm, useForm } from "../../packages/form/dist/index.js";

const root = new URL("../../", import.meta.url);

function setupContext() {
  FormContext.context = {
    templates: [
      {
        id: "test",
        adapter: "ArcoVue",
        customAdapter: { validate: () => Promise.resolve() },
        providers: {
          Form: {},
          FormItem: {},
          layouts: { Item: {}, Group: {}, List: {}, ListItem: {} },
        },
      },
    ],
    default: { templateId: "test" },
  };
  FormContext.processContext();
}

async function waitFor(predicate) {
  for (let index = 0; index < 50; index++) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error("condition timeout");
}

test("exposes an independent devtools package", () => {
  for (const path of [
    "packages/devtools/package.json",
    "packages/devtools/src/index.ts",
    "packages/devtools/src/FormDevTools.tsx",
    "packages/devtools/src/style.css",
    "packages/devtools/vite.config.ts",
    "packages/devtools/tsconfig.json",
  ]) {
    assert.ok(existsSync(new URL(path, root)), `${path} must exist`);
  }
});

test("records debug events only while debugging is enabled", async () => {
  setupContext();
  const [, controls] = useForm({
    debug: true,
    ssr: {
      renderComponent: async () => ({}),
      actions: {
        GET: async () => ({ data: [{ id: "rd", name: "研发部" }] }),
      },
    },
    schemas: [
      { component: "Input", field: "name", defaultValue: "" },
      {
        component: "Select",
        field: "department",
        componentProps: {
          options: { $dispatch: "GET", target: "/api/departments", path: "data" },
        },
      },
    ],
  });

  assert.equal(typeof controls.getRuntime, "function");
  const runtime = controls.getRuntime();

  await waitFor(() => runtime.debugEvents.value.some((event) => event.status === "fulfilled"));
  controls.model.value.name = "Ada";
  runtime.share({ readonly: true });

  const requests = runtime.debugEvents.value.filter((event) => event.kind === "request");
  assert.ok(requests.some((event) => event.status === "pending"));
  assert.ok(requests.some((event) => event.status === "fulfilled"));
  assert.ok(runtime.debugEvents.value.some((event) => event.kind === "model"));
  assert.ok(runtime.debugEvents.value.some((event) => event.kind === "share"));

  runtime.setDebug(false);
  assert.equal(runtime.debugEvents.value.length, 0);
  controls.model.value.name = "Grace";
  assert.equal(runtime.debugEvents.value.length, 0);
});


test("uses initForm debug as the default without a URL switch", () => {
  const app = { mount: () => app };
  initForm.install(app, {
    loader: async () => ({ default: { templates: [], default: { templateId: "test" } } }),
    env: "web",
    debug: true,
  });

  try {
    setupContext();
    const [, controls] = useForm({
      schemas: [{ component: "Input", field: "name", defaultValue: "" }],
    });
    assert.equal(controls.getRuntime().debugEnabled, true);
  } finally {
    FormContext.debug = false;
  }
});
