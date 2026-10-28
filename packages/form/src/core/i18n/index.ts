import { isFunction, isPlainObject, merge } from "lodash";
import {
  DEFAULT_LOCALE,
  LocaleMessages,
  builtinLocaleAliases,
  builtinMessages,
} from "@/core/i18n/messages";

export * from "@/core/i18n/messages";

export type LocaleMap = Record<string, string> | ((raw: string) => string);

/**
 * 这几个字段语义明确（历史上从未支持 plain object），所以允许业务直接写
 * locale 词典字面量而不需要显式包一层 i18n()。这是一个集中声明、可扩展的策略位，
 * 而不是散落在各处的魔法字符串判断——以后如果要支持更多字段，加到这里即可
 */
export const NATIVE_LOCALE_DICT_FIELDS = new Set([
  "label",
  "placeholder",
  "required",
]);

/**
 * 把外部千奇百怪的 locale 值（'en-UK'、'zh_CN'...）归一化成表单实例内部统一使用的
 * canonical locale。归一化只做这一次，后续内置文案表和业务自定义词典都复用这个结果，
 * 避免出现"两套映射各自维护"的问题
 *
 * 优先级：显式 localeMap（业务最了解自己系统） > 内置常见别名兜底 > 原样返回
 */
export function normalizeLocale(raw: string, localeMap?: LocaleMap): string {
  if (!raw) return raw;
  if (isFunction(localeMap)) {
    return localeMap(raw) ?? raw;
  }
  return localeMap?.[raw] ?? builtinLocaleAliases[raw] ?? raw;
}

export function mergeMessages(
  overrides?: Record<string, LocaleMessages>
): Record<string, LocaleMessages> {
  if (!overrides) return builtinMessages;
  return merge({}, builtinMessages, overrides);
}

export function getMessage(
  messages: Record<string, LocaleMessages>,
  locale: string,
  fallbackLocale: string,
  key: string
): string | undefined {
  return (
    messages[locale]?.[key] ??
    messages[fallbackLocale]?.[key] ??
    messages[DEFAULT_LOCALE]?.[key]
  );
}

/**
 * 从业务自定义的 locale 词典（如 label: { "zh-CN": "姓名", "en-US": "Name" }）
 * 里取出当前 locale 对应的文案，找不到则按 fallbackLocale 兜底，再找不到就取词典里第一个值，
 * 保证即使 locale 配置有缺漏，界面上也不会出现空白
 */
export function pickLocaleText(
  dict: Record<string, any>,
  locale: string,
  fallbackLocale: string
): any {
  if (locale in dict) return dict[locale];
  if (fallbackLocale in dict) return dict[fallbackLocale];
  return Object.values(dict)[0];
}

/**
 * 判断一个 plain object 是否"看起来像"一个 locale 词典，而不是普通的嵌套 schema 配置。
 * 作为 NATIVE_LOCALE_DICT_FIELDS / i18n() 之外的兜底防呆：只要值不是全部为 string，
 * 就不当作词典处理，避免把结构配置类的 object 误判
 */
export function isLocaleDict(value: any): value is Record<string, string> {
  if (!isPlainObject(value)) return false;
  const values = Object.values(value);
  if (values.length === 0) return false;
  return values.every((item) => typeof item === "string");
}
