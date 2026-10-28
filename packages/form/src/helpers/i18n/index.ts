import { merge } from "lodash";

/**
 * 显式标记一个词典对象为"i18n 词典"，用于给 componentProps、tooltip 等本身就是
 * plain object、语义不确定的字段做多语言处理。像 label / placeholder / required
 * 这几个语义明确、原本就不允许是 plain object 的字段，可以直接写词典字面量，不需要包一层 i18n()
 *
 * 词典的 value 不局限于 string，比如可以是一整个 componentProps 对象（不同 locale 下
 * options 文案不同），取值时会按当前 locale 整体替换
 *
 * @example
 * componentProps: i18n({
 *   "zh-CN": { options: [{ label: "男", value: "male" }] },
 *   "en-US": { options: [{ label: "Male", value: "male" }] },
 * })
 */
export function i18n<T = string>(dict: Record<string, T>) {
  return merge(
    { ...dict },
    {
      __nuvzek_form_i18n__: true,
    },
  );
}

export function isI18nDict(value: any): boolean {
  return value?.__nuvzek_form_i18n__ === true;
}
