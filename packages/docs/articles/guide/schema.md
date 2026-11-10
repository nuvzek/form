# Schema 与动态属性

本地 Schema 是描述表单的 JavaScript/TypeScript 数组。`defineFormSchema` 是类型辅助函数，返回值就是原数组；它不会在运行时校验 Schema。

## 普通字段

```ts
import { Input } from "@arco-design/web-vue";
import { defineFormSchema } from "@nuvzek/form";

export default defineFormSchema([
  {
    component: Input,
    field: "user.name",
    label: "姓名",
    required: true,
    defaultValue: "",
    placeholder: "请输入姓名",
    span: 12,
    componentProps: {
      allowClear: true,
    },
  },
]);
```

常用属性：

| 属性 | 作用 |
| --- | --- |
| `component` | 实际渲染的 Vue 组件 |
| `field` | model 中的字段路径，支持 `user.name` 等嵌套路径 |
| `label` | FormItem 标签 |
| `defaultValue` | 初始值；支持同步或异步函数 |
| `required` | 必填布尔值或自定义必填提示 |
| `rules` | 当前 UI 库的原生校验规则 |
| `componentProps` | 传给输入组件的原生属性 |
| `componentSlots` | 输入组件插槽 |
| `formItemProps` | 传给 FormItem 的原生属性 |
| `formItemSlots` | FormItem 插槽 |
| `show` | 控制是否渲染，支持布尔值或动态函数 |
| `span` | 24 栅格中的宽度 |
| `layout` | 自定义布局名称或布局组件 |

普通字段的 `type` 默认为 `item`。展示型组件可以没有 `field`。

## 分组

```ts
{
  type: "group",
  label: "基本信息",
  children: [
    { component: Input, field: "name", label: "姓名" },
    { component: Input, field: "phone", label: "手机号" },
  ],
}
```

Group 只组织 Schema 和布局，不会给 model 增加一层路径。上例的提交结构仍是 `{ name, phone }`，不是 `{ 基本信息: { name, phone } }`。

## 列表

```ts
{
  type: "list",
  field: "contacts",
  minLen: 1,
  children: [
    { component: Input, field: "name", label: "联系人", required: true },
    { component: Input, field: "phone", label: "联系电话" },
  ],
}
```

List 的 `field` 指向数组。子字段使用相对路径，最终形成 `contacts.0.name`、`contacts.0.phone`。

不要写成：

```ts
// 错误：重复了父级路径
{ component: Input, field: "contacts.name" }
```

`minLen` 控制允许保留的最少行数，默认为 1。新增行使用初始化完成时保存的默认值模板。

## 动态 Schema

Schema 属性可以写成函数：

```ts
{
  component: Input,
  field: "otherReason",
  label: "其他原因",
  show: ({ model }: any) => model.reason === "other",
  componentProps: {
    disabled: ({ shared }: any) => shared.readonly,
  },
}
```

函数可以使用：

| 工具 | 作用 |
| --- | --- |
| `model` | 当前表单数据 |
| `shared` | 当前实例的共享状态 |
| `share(value)` | 合并共享状态 |
| `refs` | 字段组件实例引用 |
| `locale` | 当前归一化后的语言 |

对 `model`、`shared` 和 `locale` 的读取会被追踪，相关值变化时重新计算属性。属性也可以返回 Promise；异步结果就绪前，对应属性会暂时为 `undefined`。

当前 Raw Schema 类型较宽松。在开启 `noImplicitAny` 的项目中，需要显式标注函数参数。

## 异步 Schema

整个 `schemas` 也可以是同步函数或异步函数：

```ts
const [Form] = useForm({
  schemas: async () => {
    const response = await fetchSchemas();
    return response;
  },
});
```

如果返回的是可序列化 JSON，还需要配置 [SSR 运行时](./ssr)。

## 原生事件与 `raw`

普通函数会被 Form 当作动态属性执行。事件回调需要使用 `raw` 保留：

```ts
import { raw } from "@nuvzek/form";

componentProps: {
  onChange: raw((utils: any, value: any) => {
    utils.share({ selectedValue: value });
  }),
}
```

事件函数的第一个参数是 Form 工具，后续参数才是组件原生事件参数。

`raw(object)` 也会阻止对象继续被深度解析，适用于带函数属性的 lookup 配置等场景。

## 只计算一次

使用 `once` 包裹动态函数后，函数仍会执行，但不会注册持续的 model、shared 或 locale 依赖：

```ts
import { once } from "@nuvzek/form";

componentProps: {
  options: once(async () => fetchOptions()),
}
```

需要响应后续变化时，不要使用 `once`。
