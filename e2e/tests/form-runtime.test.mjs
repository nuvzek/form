import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { FormContext, useForm } from "../../packages/form/dist/index.js";

const distUrl = new URL("../../packages/form/dist/index.js", import.meta.url).href;
const root = fileURLToPath(new URL("../../", import.meta.url));

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

async function ready(form) {
  await Promise.race([
    new Promise((resolve) => form.isReady(resolve)),
    new Promise((_, reject) => setTimeout(() => reject(new Error("form ready timeout")), 1000)),
  ]);
}

async function waitFor(predicate) {
  for (let index = 0; index < 50; index++) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error("condition timeout");
}

test("preserves local component objects and null options when SSR is enabled", async () => {
  setupContext();
  const localComponent = { name: "LocalInput", props: { nullable: null } };

  const [, form] = useForm({
    ssr: { renderComponent: async () => assert.fail("local component must not be remapped"), actions: {} },
    schemas: [
      {
        component: localComponent,
        field: "name",
        defaultValue: "Ada",
        componentProps: { nullable: null },
      },
    ],
  });

  await ready(form);
  assert.equal(form.model.value.name, "Ada");
  assert.deepEqual(form.schemas.value[0].component, localComponent);
  assert.equal(form.schemas.value[0].component.props.nullable, null);
});

test("resolves string components and tolerates nested null in SSR schemas", async () => {
  setupContext();
  const remoteComponent = { name: "RemoteInput", props: { nested: null } };
  const requests = [];

  const [, form] = useForm({
    ssr: {
      renderComponent: async (name) => {
        requests.push(name);
        return remoteComponent;
      },
      actions: {},
    },
    schemas: [{ component: "Input", field: "name", componentProps: { nullable: null } }],
  });

  await ready(form);
  await waitFor(() => form.schemas.value[0]?.component?.name === "RemoteInput");
  assert.deepEqual(requests, ["Input"]);
});

test("reports unregistered request actions instead of failing silently", () => {
  const script = `
    import { FormContext, useForm } from ${JSON.stringify(distUrl)};
    FormContext.context = {
      templates: [{ id: "test", adapter: "ArcoVue", providers: { Form: {}, FormItem: {}, layouts: { Item: {}, Group: {}, List: {}, ListItem: {} } } }],
      default: { templateId: "test" },
    };
    FormContext.processContext();
    useForm({
      ssr: { renderComponent: async () => ({}), actions: {} },
      schemas: [{ component: "Select", field: "department", componentProps: { options: { $dispatch: "GET", target: "/api/departments" } } }],
    });
    setTimeout(() => {}, 100);
  `;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: root,
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0, result.stderr);
  assert.match(result.stderr, /SSR action "GET" is not registered/);
});

test("strict map transforms reject non-array responses with a useful error", () => {
  const script = `
    import { FormContext, useForm } from ${JSON.stringify(distUrl)};
    FormContext.context = {
      templates: [{ id: "test", adapter: "ArcoVue", providers: { Form: {}, FormItem: {}, layouts: { Item: {}, Group: {}, List: {}, ListItem: {} } } }],
      default: { templateId: "test" },
    };
    FormContext.processContext();
    useForm({
      ssr: {
        renderComponent: async () => ({}),
        actions: { GET: async () => ({ data: { items: [] } }) },
      },
      schemas: [{
        component: "Select",
        field: "department",
        componentProps: {
          options: {
            $dispatch: "GET",
            target: "/api/departments",
            path: "data",
            strict: true,
            transform: { method: "map", relation: { id: "value", name: "label" } }
          }
        }
      }],
    });
    setTimeout(() => {}, 100);
  `;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: root,
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0, result.stderr);
  assert.match(result.stderr, /transform.map expected an array/);
});

test("strict map transforms still map valid arrays", async () => {
  setupContext();
  const [, form] = useForm({
    ssr: {
      renderComponent: async () => ({}),
      actions: { GET: async () => ({ data: [{ id: "rd", name: "研发部" }] }) },
    },
    schemas: [
      {
        component: "Select",
        field: "department",
        componentProps: {
          options: {
            $dispatch: "GET",
            target: "/api/departments",
            path: "data",
            strict: true,
            transform: { method: "map", relation: { id: "value", name: "label" } },
          },
        },
      },
    ],
  });

  await ready(form);
  await waitFor(() => Array.isArray(form.schemas.value[0]?.componentProps?.options));
  assert.deepEqual(form.schemas.value[0].componentProps.options, [
    { id: "rd", name: "研发部", value: "rd", label: "研发部" },
  ]);
});
