# 国际化

Form 内置 `zh-CN`、`en-US` 和 `zh-HK` 的占位符及必填提示。

## 设置语言

```ts
const [Form, { locale }] = useForm({
  schemas,
  locale: "en-US",
});
```

`locale` 支持普通值、ref、computed 或 getter，因此可以直接连接 Pinia 或 Vue I18n：

```ts
const localeStore = useLocaleStore();
const { locale } = storeToRefs(localeStore);

const [Form] = useForm({
  schemas,
  locale,
});
```

外部 ref 变化时，使用词典的 Schema 属性会重新计算。返回的 `locale` 是只读 computed，可在表单外读取当前语言。

## 语言名称归一化

业务系统使用的标记可能与内置词典不同：

```ts
useForm({
  schemas,
  locale,
  localeMap: {
    "en-UK": "en-US",
    cantonese: "zh-HK",
  },
});
```

`localeMap` 也可以是函数：

```ts
localeMap: (raw: string) => raw.startsWith("en") ? "en-US" : raw,
```

显式 `localeMap` 优先于内置别名。内置别名包括 `zh`、`zh-Hans`、`en`、`en-GB`、`yue` 等常见形式。

## 字段词典

`label`、`placeholder` 和 `required` 可以直接写词典：

```ts
{
  component: Input,
  field: "name",
  label: {
    "zh-CN": "姓名",
    "en-US": "Name",
    "zh-HK": "姓名",
  },
  required: true,
}
```

必填提示和自动 placeholder 会使用当前已解析的 label。

## 其他属性

本地 Schema 中使用 `i18n` 显式标记其他词典：

```ts
import { i18n } from "@nuvzek/form";

componentProps: i18n({
  "zh-CN": {
    options: [{ label: "男", value: "male" }],
  },
  "en-US": {
    options: [{ label: "Male", value: "male" }],
  },
})
```

词典值不局限于字符串，可以是整个配置对象。纯 JSON 中使用 [`I18N` Dispatch](./dispatch#国际化动作)。

## 兜底语言与内置文案

```ts
useForm({
  schemas,
  locale: "fr-FR",
  fallbackLocale: "en-US",
  messages: {
    "fr-FR": {
      "placeholder.input": "Veuillez saisir {label}",
      "placeholder.select": "Veuillez sélectionner {label}",
      "rule.required": "{label} est obligatoire",
    },
  },
});
```

支持覆盖或扩展：

- `placeholder.input`
- `placeholder.select`
- `rule.required`

字段文案找不到当前语言时，先使用 `fallbackLocale`，再取词典中的第一个值。内置提示还会在必要时回退到 `zh-CN`。

## 完整语言切换示例

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Input, Radio, RadioGroup, Select } from "@arco-design/web-vue";
import { i18n, useForm } from "@nuvzek/form";

const locale = ref("zh-CN");

const [Form, { locale: resolvedLocale }] = useForm({
  locale,
  schemas: [
    {
      component: Input,
      field: "name",
      label: { "zh-CN": "姓名", "en-US": "Name" },
      required: true,
    },
    {
      component: Select,
      field: "gender",
      label: { "zh-CN": "性别", "en-US": "Gender" },
      required: true,
      componentProps: i18n({
        "zh-CN": {
          options: [{ label: "男", value: "male" }],
        },
        "en-US": {
          options: [{ label: "Male", value: "male" }],
        },
      }),
    },
  ],
});
</script>

<template>
  <RadioGroup v-model="locale" type="button">
    <Radio value="zh-CN">简体中文</Radio>
    <Radio value="en-US">English</Radio>
  </RadioGroup>
  <p>当前语言：{{ resolvedLocale }}</p>
  <Form />
</template>
```

切换语言后，label、自动 placeholder、必填提示和 `i18n()` 包裹的选项都会重新计算。

## 配置全局默认值

全局默认值放在 `defineFormSetup.default` 中：

```ts
export default defineFormSetup({
  templates,
  default: {
    templateId: "basic",
    locale,
    localeMap: { "en-UK": "en-US" },
    fallbackLocale: "zh-CN",
    messages: customMessages,
  },
});
```

单个 `useForm` 可以覆盖这些配置。对象形式的 localeMap 和 messages 会合并；函数形式的 localeMap 由实例配置优先。

## 自动占位符

未显式设置 `placeholder` 时，Form 根据解析后的组件名判断使用输入还是选择提示。组件名包含 `select`、`tree` 或 `cascader` 时使用 `placeholder.select`，否则使用 `placeholder.input`。

自定义组件名无法表达这种语义时，直接设置 Schema 的 `placeholder` 更可靠。

## 验证清单

至少切换两种语言，并切回一次，检查：

- label 和显式 placeholder。
- 自动生成的 placeholder。
- 必填错误提示。
- Select 等组件的选项。
- 读取 `utils.locale` 的动态属性。
- SSR JSON 中的 `I18N` 分支。

响应式语言切换完成后，再断言最终文案。
