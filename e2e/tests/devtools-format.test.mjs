import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDebugValue } from "../../packages/devtools/dist/index.js";

test("serializes circular schemas without falling back to object stringification", () => {
  const component = { name: "Input" };
  component.self = component;

  const result = formatDebugValue([
    {
      component,
      field: "name",
      defaultValue: "",
    },
  ]);

  assert.match(result, /"field": "name"/);
  assert.match(result, /\[Circular\]/);
  assert.doesNotMatch(result, /\[object Object\]/);
});

test("keeps function and Error values readable", () => {
  function loadOptions() {}
  const result = formatDebugValue({
    loadOptions,
    error: new Error("request failed"),
  });

  assert.match(result, /\[Function loadOptions\]/);
  assert.match(result, /request failed/);
});
