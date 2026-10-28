import { isBoolean, isString } from "lodash";
import Runtime from "@/core/runtime";
import { renderTemplate } from "@/core/i18n/messages";

export function useRules(schema: AnyObject, runtime: Runtime) {
  let { rules, required } = schema;
  rules = rules ? [...rules] : [];
  const requiredRuleIndex = rules.findIndex(
    (rule: AnyObject) => required in rule
  );
  if (isString(required)) {
    const requiredRule = { required: true, message: required };
    if (requiredRuleIndex >= 0) {
      rules[requiredRuleIndex] = requiredRule;
    } else {
      rules.unshift(requiredRule);
    }
  } else if (isBoolean(required) && required) {
    const template = runtime.getMessage("rule.required");
    const message =
      renderTemplate(template, { label: schema.label }) ??
      `${schema.label}不能为空`;
    const rule = { required: true, message };
    if (requiredRuleIndex >= 0) {
      rules[requiredRuleIndex] = rule;
    } else {
      rules.unshift(rule);
    }
  }

  return rules;
}
