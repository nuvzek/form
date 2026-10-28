import Runtime from "@/core/runtime";
import { renderTemplate } from "@/core/i18n/messages";

const SELECT_LIKE_KEYWORDS = ["select", "tree", "cascader"];

function resolveMessageKey(componentName?: string) {
  const isSelectLike = SELECT_LIKE_KEYWORDS.some((keyword) =>
    componentName?.toLowerCase().includes(keyword)
  );
  return isSelectLike ? "placeholder.select" : "placeholder.input";
}

export function usePlaceholder(
  label: string,
  componentName: string | undefined,
  runtime: Runtime
) {
  if (!label) return;
  const messageKey = resolveMessageKey(componentName);
  const template = runtime.getMessage(messageKey);
  return renderTemplate(template, { label }) ?? label;
}
