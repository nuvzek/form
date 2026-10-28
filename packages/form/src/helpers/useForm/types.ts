import { SSR } from "@/core/context/types";
import { LocaleMap } from "@/core/i18n";
import { LocaleMessages } from "@/core/i18n/messages";
import { RawSchemas } from "@/helpers/defineFormSchema/types";
import { MaybeRefOrGetter } from "vue";

export type UseFormOptions = {
  templateId?: string;
  noAutoLookup?: boolean;
  schemas:
    | RawSchemas
    | ((...args: any[]) => RawSchemas)
    | ((...args: any[]) => Promise<RawSchemas>);
  layoutGap?: number;
  listLayoutGap?: number;
  formProps?: any;
  formSlots?: any;
  ssr?: SSR;
  namesToRemember?: Record<string, string>;
  collectDisplayValues?: boolean;
  /**
   * 外部的响应式 locale 来源，支持普通值 / ref / computed / getter 函数，
   * 例如 () => store.locale、storeToRefs(store).locale、vue-i18n 的 locale 等
   */
  locale?: MaybeRefOrGetter<string>;
  /**
   * 把外部的 locale 值归一化成库内部统一使用的 canonical locale（zh-CN / en-US / zh-HK ...），
   * 用于抹平业务系统里 'en-UK'、'zh_CN' 之类的命名差异
   */
  localeMap?: LocaleMap;
  /**
   * 词典里找不到当前 locale 对应文案时的兜底 locale，默认 "zh-CN"
   */
  fallbackLocale?: string;
  /**
   * 覆盖/扩展内置文案（请选择 {label} / 请输入 {label} / {label} 不能为空），
   * 也可以借此新增内置库没有的语言包
   */
  messages?: Record<string, LocaleMessages>;
};
