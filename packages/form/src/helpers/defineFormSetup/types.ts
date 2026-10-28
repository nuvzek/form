import { LocaleMap } from "@/core/i18n";
import { LocaleMessages } from "@/core/i18n/messages";
import { MaybeRefOrGetter } from "vue";

export type Component = any;

export type BuiltInAdapter = "ArcoVue" | (string & {});

export type ResolvedKeys = {
  labelKey: string;
  valueKey: string;
  childrenKey: string;
};

export type CustomAdapter = {
  formModelName: string;
  formModelKey: string; // 用于唯一标识某个表单域
  validate: () => Promise<void>;
  resolveKeys?: (componentProps: any) => ResolvedKeys | null;
};

export type Template =
  | {
      id: string;
      adapter: BuiltInAdapter;
      providers: {
        Form: Component;
        FormItem: Component;
        layouts: {
          Item: Component;
          Group: Component;
          List: Component;
          ListItem: Component;
        } & Record<string, Component>;
      };
    }
  | {
      id: string;
      customAdapter: CustomAdapter;
      providers: {
        Form: Component;
        FormItem: Component;
        layouts: {
          Item: Component;
          Group: Component;
          List: Component;
          ListItem: Component;
        } & Record<string, Component>;
      };
    }
  | {
      id: string;
      adapter: BuiltInAdapter; // 同时都存在时默认认为继承了 adpater 的内容，同时 custom 中的同名的策略会补充进去作为覆盖
      customAdapter: Partial<CustomAdapter>;
      providers: {
        Form: Component;
        FormItem: Component;
        layouts: {
          Item: Component;
          Group: Component;
          List: Component;
          ListItem: Component;
        } & Record<string, Component>;
      };
    };

export type DefineFormSetupOptions = {
  templates: Template[];
  default: {
    templateId: string;
    formProps?: AnyObject;
    listLayoutGap?: number;
    gapBgColor?: string;
    layoutGap?: number;
    /** 全局默认的 locale 来源，单个 useForm 可以覆盖，用法同 useForm 的 locale */
    locale?: MaybeRefOrGetter<string>;
    /** 全局默认的 locale 归一化规则，单个 useForm 可以覆盖 */
    localeMap?: LocaleMap;
    /** 全局默认的兜底 locale，单个 useForm 可以覆盖 */
    fallbackLocale?: string;
    /** 全局默认/扩展的内置文案，单个 useForm 可以覆盖 */
    messages?: Record<string, LocaleMessages>;
  };
};
