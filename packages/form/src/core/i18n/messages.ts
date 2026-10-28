/**
 * 内置文案表，覆盖范围严格限制在"库自己需要兜底渲染的通用文案"上：
 * - 组件未显式提供 placeholder 时的默认占位符（请选择 / 请输入）
 * - required: true 时自动生成的校验文案
 *
 * 这里存的是完整的句子模板（带 {label} 占位符），而不是孤立的动词短语，
 * 因为不同语言里"动词 + 字段名"的语序并不一样（例如中文"请输入姓名" vs 英文
 * "Please enter Name"），如果只翻译动词再无脑拼接 `${verb}${label}`，英文语序会错。
 * {label} 会在使用时被替换成当前 locale 下已经解析好的字段 label 文案。
 *
 * 业务自己的字段文案（label 本身的翻译）不应该塞进这里，而是通过 schema 上的
 * i18n 词典（对象字面量或 i18n() helper）由业务自行维护。
 */
export type LocaleMessages = Record<string, string>;

export const DEFAULT_LOCALE = "zh-CN";

export const builtinMessages: Record<string, LocaleMessages> = {
  "zh-CN": {
    "placeholder.select": "请选择{label}",
    "placeholder.input": "请输入{label}",
    "rule.required": "{label}不能为空",
  },
  "en-US": {
    "placeholder.select": "Please select {label}",
    "placeholder.input": "Please enter {label}",
    "rule.required": "{label} is required",
  },
  "zh-HK": {
    "placeholder.select": "請選擇{label}",
    "placeholder.input": "請輸入{label}",
    "rule.required": "{label}為必填項",
  },
};

/**
 * 常见 locale 别名兜底表，用于在业务没有显式提供 localeMap 时也能有基本的开箱体验，
 * 比如后端/浏览器给的可能是 zh、zh-Hans、en、en-GB、yue 之类的变体。
 * 这里的映射优先级低于用户显式传入的 localeMap。
 */
export const builtinLocaleAliases: Record<string, string> = {
  zh: "zh-CN",
  "zh-Hans": "zh-CN",
  "zh-CN": "zh-CN",
  en: "en-US",
  "en-GB": "en-US",
  "en-US": "en-US",
  yue: "zh-HK",
  "yue-Hant": "zh-HK",
  "zh-Hant-HK": "zh-HK",
  "zh-HK": "zh-HK",
};

/**
 * 把形如 "请输入{label}" 的模板和一个已经解析好的 label 文案拼接成最终展示文案
 */
export function renderTemplate(
  template: string | undefined,
  vars: Record<string, any>,
): string | undefined {
  if (!template) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] === undefined || vars[key] === null ? "" : String(vars[key]),
  );
}
