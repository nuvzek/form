#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REQUESTS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH"]);
const BUILT_IN_ACTIONS = new Set([
  ...REQUESTS,
  "CONDITION",
  "EVENT_HANDLER",
  "SET_MODEL",
  "SET_SHARED",
  "GET_MODEL",
  "GET_SHARED",
  "REFS",
  "I18N",
]);
const OPERATORS = new Set([
  "eq",
  "ne",
  "gt",
  "ge",
  "gte",
  "lt",
  "le",
  "lte",
  "between",
  "not_between",
  "in",
  "not_in",
  "like",
  "not_like",
  "like_left",
  "not_like_left",
  "like_right",
  "not_like_right",
]);

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function has(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

export function validateSchema(schema) {
  const issues = [];
  const error = (path, message) => issues.push({ severity: "error", path, message });
  const warning = (path, message) =>
    issues.push({ severity: "warning", path, message });

  function validateChildren(node, path, parentListField) {
    if (!Array.isArray(node.children) || node.children.length === 0) {
      error(`${path}.children`, "children 必须是非空数组");
      return;
    }
    validateNodes(node.children, `${path}.children`, parentListField);
  }

  function validateNodes(nodes, path, parentListField) {
    nodes.forEach((node, index) => validateNode(node, `${path}[${index}]`, parentListField));
  }

  function validateNode(node, path, parentListField) {
    if (!isObject(node)) {
      error(path, "Schema 节点必须是对象");
      return;
    }

    const type = node.type ?? "item";
    if (!["item", "group", "list"].includes(type)) {
      error(`${path}.type`, "type 仅支持 item、group 或 list");
      return;
    }

    if (type === "item" && (typeof node.component !== "string" || !node.component.trim())) {
      error(`${path}.component`, "SSR item 的 component 必须是非空字符串");
    }

    if (type === "list" && (typeof node.field !== "string" || !node.field.trim())) {
      error(`${path}.field`, "list 必须提供非空 field");
    }

    if (has(node, "field") && (typeof node.field !== "string" || !node.field.trim())) {
      error(`${path}.field`, "field 必须是非空字符串");
    }

    if (
      parentListField &&
      typeof node.field === "string" &&
      (node.field === parentListField || node.field.startsWith(`${parentListField}.`))
    ) {
      error(
        `${path}.field`,
        `list 子字段必须使用相对路径，不应重复父级 ${parentListField}`,
      );
    }

    if (has(node, "minLen") && (!Number.isInteger(node.minLen) || node.minLen < 0)) {
      error(`${path}.minLen`, "minLen 必须是非负整数");
    }

    if (
      has(node, "span") &&
      (typeof node.span !== "number" || node.span <= 0 || node.span > 24)
    ) {
      error(`${path}.span`, "span 必须是 1 到 24 之间的数字");
    }

    if (type === "group") {
      validateChildren(node, path, parentListField);
    } else if (type === "list") {
      validateChildren(node, path, node.field);
    }

    for (const [key, value] of Object.entries(node)) {
      if (key !== "children") validateValue(value, `${path}.${key}`);
    }
  }

  function validateCondition(condition, path) {
    if (!isObject(condition)) {
      error(path, "条件必须是对象");
      return;
    }
    if (has(condition, "and") || has(condition, "or")) {
      for (const key of ["and", "or"]) {
        if (!has(condition, key)) continue;
        if (!Array.isArray(condition[key]) || condition[key].length === 0) {
          error(`${path}.${key}`, `${key} 必须是非空条件数组`);
        } else {
          condition[key].forEach((child, index) =>
            validateCondition(child, `${path}.${key}[${index}]`),
          );
        }
      }
      return;
    }
    if (typeof condition.op !== "string" || !OPERATORS.has(condition.op)) {
      error(`${path}.op`, `op 必须是支持的操作符：${[...OPERATORS].join(", ")}`);
    }
  }

  function validateDispatch(data, path) {
    const dispatch = data.$dispatch;
    if (typeof dispatch !== "string" || !dispatch.trim()) {
      error(`${path}.$dispatch`, "$dispatch 必须是非空字符串");
      return;
    }

    if (!BUILT_IN_ACTIONS.has(dispatch)) {
      warning(
        `${path}.$dispatch`,
        `${dispatch} 是自定义动作，宿主必须在 ssr.actions 中注册同名实现`,
      );
      return;
    }

    if (REQUESTS.has(dispatch)) {
      if (typeof data.target !== "string" || !data.target.trim()) {
        error(`${path}.target`, `${dispatch} 必须提供非空 target`);
      }
      if (has(data, "path") && typeof data.path !== "string") {
        error(`${path}.path`, "path 必须是 lodash.get 风格字符串");
      }
      for (const key of ["params", "data"]) {
        if (has(data, key) && !isObject(data[key])) {
          error(`${path}.${key}`, `${key} 必须是对象`);
        }
      }
      if (has(data, "transform")) {
        if (!isObject(data.transform) || data.transform.method !== "map") {
          error(`${path}.transform`, "当前仅支持 transform.method = map");
        } else if (!isObject(data.transform.relation)) {
          error(`${path}.transform.relation`, "map transform 必须提供 relation 对象");
        }
      }
    } else if (dispatch === "CONDITION") {
      validateCondition(data, path);
    } else if (dispatch === "EVENT_HANDLER") {
      if (!Array.isArray(data.pipes) || data.pipes.length === 0) {
        error(`${path}.pipes`, "EVENT_HANDLER 必须提供非空 pipes 数组");
      }
    } else if (["SET_MODEL", "SET_SHARED"].includes(dispatch)) {
      if (typeof data.field !== "string" || !data.field.trim()) {
        error(`${path}.field`, `${dispatch} 必须提供非空 field`);
      }
      if (!has(data, "as")) {
        error(`${path}.as`, `${dispatch} 必须提供 as`);
      }
    } else if (["GET_MODEL", "GET_SHARED"].includes(dispatch)) {
      if (typeof data.field !== "string" || !data.field.trim()) {
        error(`${path}.field`, `${dispatch} 必须提供非空 field`);
      }
    } else if (dispatch === "REFS") {
      if (typeof data.field !== "string" || !data.field.trim()) {
        error(`${path}.field`, "REFS 必须提供组件 field");
      }
      if (!has(data, "get") && !has(data, "call")) {
        error(path, "REFS 必须提供 get 或 call");
      }
    } else if (dispatch === "I18N" && !isObject(data.values)) {
      error(`${path}.values`, "I18N 必须提供 values 词典对象");
    }
  }

  function validateValue(value, path) {
    if (typeof value === "string") {
      for (const token of ["$model", "$shared", "$res", "$err", "$args"]) {
        if (value === token) {
          error(path, `${token} 不能直接求值，请提供具体路径，例如 ${token}.data`);
        }
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => validateValue(item, `${path}[${index}]`));
      return;
    }
    if (!isObject(value)) return;

    if (has(value, "$dispatch")) validateDispatch(value, path);
    for (const [key, child] of Object.entries(value)) {
      validateValue(child, `${path}.${key}`);
    }
  }

  if (!Array.isArray(schema)) {
    error("$", "SSR Schema 根节点必须是数组");
  } else {
    validateNodes(schema, "$", undefined);
  }

  return { valid: !issues.some((issue) => issue.severity === "error"), issues };
}

export function formatIssues(result) {
  if (result.issues.length === 0) return "Schema valid.";
  return result.issues
    .map((issue) => `${issue.severity.toUpperCase()} ${issue.path}: ${issue.message}`)
    .join("\n");
}

export function main(argv = process.argv.slice(2)) {
  const jsonOutput = argv.includes("--json");
  const file = argv.find((argument) => !argument.startsWith("--"));
  let source;
  try {
    source = file ? readFileSync(resolve(file), "utf8") : readFileSync(0, "utf8");
  } catch (error) {
    console.error(`无法读取 Schema：${error.message}`);
    return 1;
  }

  let schema;
  try {
    schema = JSON.parse(source);
  } catch (error) {
    if (jsonOutput) {
      console.log(
        JSON.stringify(
          {
            valid: false,
            issues: [{ severity: "error", path: "$", message: `JSON 解析失败：${error.message}` }],
          },
          null,
          2,
        ),
      );
    } else {
      console.error(`JSON 解析失败：${error.message}`);
    }
    return 1;
  }

  const result = validateSchema(schema);
  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    (result.valid ? console.log : console.error)(formatIssues(result));
  }
  return result.valid ? 0 : 1;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  process.exitCode = main();
}
