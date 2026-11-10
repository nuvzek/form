import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const validatorPath = new URL(
  "../../skills/nuvzek-form/scripts/validate-ssr-schema.mjs",
  import.meta.url,
);

async function loadValidator() {
  assert.ok(existsSync(validatorPath), "validate-ssr-schema.mjs must exist");
  return import(validatorPath);
}

function errorsAt(result, path) {
  return result.issues.filter(
    (issue) => issue.severity === "error" && issue.path === path,
  );
}

test("accepts static fields, groups, lists, and display-only components", async () => {
  const { validateSchema } = await loadValidator();
  const result = validateSchema([
    { component: "Input", field: "name", label: "姓名", required: true },
    {
      type: "group",
      children: [
        { component: "Select", field: "gender", componentProps: { options: [] } },
      ],
    },
    {
      type: "list",
      field: "items",
      children: [{ component: "Input", field: "name" }],
    },
    { component: "Counter", label: "计数器" },
  ]);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("rejects a non-array root and invalid node structures with exact paths", async () => {
  const { validateSchema } = await loadValidator();

  const root = validateSchema({ component: "Input" });
  assert.equal(root.valid, false);
  assert.ok(errorsAt(root, "$").some((issue) => issue.message.includes("数组")));

  const result = validateSchema([
    { field: "name" },
    { type: "group", children: {} },
    { type: "list", children: [] },
    { type: "unknown" },
  ]);

  assert.equal(result.valid, false);
  assert.ok(errorsAt(result, "$[0].component").length > 0);
  assert.ok(errorsAt(result, "$[1].children").length > 0);
  assert.ok(errorsAt(result, "$[2].field").length > 0);
  assert.ok(errorsAt(result, "$[2].children").length > 0);
  assert.ok(errorsAt(result, "$[3].type").length > 0);
});

test("rejects list children that repeat their parent list path", async () => {
  const { validateSchema } = await loadValidator();
  const result = validateSchema([
    {
      type: "list",
      field: "items",
      children: [{ component: "Input", field: "items.name" }],
    },
  ]);

  assert.equal(result.valid, false);
  assert.ok(errorsAt(result, "$[0].children[0].field")[0].message.includes("相对"));
});

test("validates built-in dispatch contracts recursively", async () => {
  const { validateSchema } = await loadValidator();
  const result = validateSchema([
    {
      component: "Select",
      field: "department",
      componentProps: {
        options: { $dispatch: "GET", path: "data" },
        onChange: {
          $dispatch: "EVENT_HANDLER",
          pipes: [
            { $dispatch: "SET_MODEL", field: "approver" },
            { $dispatch: "CONDITION", left: "$model.department" },
          ],
        },
      },
    },
  ]);

  assert.equal(result.valid, false);
  assert.ok(errorsAt(result, "$[0].componentProps.options.target").length > 0);
  assert.ok(
    errorsAt(result, "$[0].componentProps.onChange.pipes[0].as").length > 0,
  );
  assert.ok(
    errorsAt(result, "$[0].componentProps.onChange.pipes[1].op").length > 0,
  );
});

test("rejects bare result references but allows custom host actions with a warning", async () => {
  const { validateSchema } = await loadValidator();
  const result = validateSchema([
    {
      component: "Input",
      field: "name",
      defaultValue: {
        $dispatch: "SET_MODEL",
        field: "name",
        as: "$res",
        then: { $dispatch: "ALERT", message: "done" },
      },
    },
  ]);

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some(
      (issue) => issue.severity === "error" && issue.message.includes("$res"),
    ),
  );
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.severity === "warning" &&
        issue.path.endsWith(".then.$dispatch") &&
        issue.message.includes("ALERT"),
    ),
  );
});

test("CLI supports files, stdin, JSON output, and meaningful exit codes", async () => {
  await loadValidator();
  const valid = JSON.stringify([{ component: "Input", field: "name" }]);
  const invalid = JSON.stringify([{ field: "name" }]);

  const validRun = spawnSync(process.execPath, [validatorPath.pathname, "--json"], {
    input: valid,
    encoding: "utf8",
  });
  assert.equal(validRun.status, 0, validRun.stderr);
  assert.equal(JSON.parse(validRun.stdout).valid, true);

  const invalidRun = spawnSync(process.execPath, [validatorPath.pathname, "--json"], {
    input: invalid,
    encoding: "utf8",
  });
  assert.equal(invalidRun.status, 1);
  assert.equal(JSON.parse(invalidRun.stdout).valid, false);

  const parseRun = spawnSync(process.execPath, [validatorPath.pathname], {
    input: "not json",
    encoding: "utf8",
  });
  assert.equal(parseRun.status, 1);
  assert.ok(parseRun.stderr.includes("JSON"));
});
