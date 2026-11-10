# UI 库与适配器

Form 通过模板适配不同 UI 库。模板决定 Form、FormItem、布局以及校验调用方式。

## 内置适配器

| 适配器 ID | Form model 属性 | FormItem 字段属性 |
| --- | --- | --- |
| `ArcoVue` | `model` | `field` |
| `NaiveUI` | `model` | `key` |
| `NutUI` | `modelValue` | `prop` |

```ts
{
  id: "basic",
  adapter: "ArcoVue",
  providers: {
    Form,
    FormItem,
    layouts: { Item, Group, List, ListItem },
  },
}
```

内置适配器只统一基础连接。组件 props、事件、slots 和自定义 rules 仍属于对应 UI 库。

## 自定义适配器

以 Element Plus 为例，它使用 `model`、`prop`，并提供 Promise 风格的 `validate()`：

```ts
import { defineFormSetup } from "@nuvzek/form";
import { ElForm, ElFormItem } from "element-plus";

export default defineFormSetup({
  templates: [
    {
      id: "element-plus",
      customAdapter: {
        formModelName: "model",
        formModelKey: "prop",
        validate: (runtime?: any) =>
          runtime._render.formRef.value.validate().then(() => undefined),
        resolveKeys: () => null,
      },
      providers: {
        Form: ElForm,
        FormItem: ElFormItem,
        layouts: { Item, Group, List, ListItem },
      },
    },
  ],
  default: { templateId: "element-plus" },
});
```

当前 `CustomAdapter.validate` 的公开类型声明为无参数函数，但运行时会传入 Runtime。示例中的可选参数写法同时满足当前类型和运行行为。

### 配置项

| 配置 | 作用 |
| --- | --- |
| `formModelName` | 传给 Form 的 model 属性名 |
| `formModelKey` | 传给 FormItem 的字段路径属性名 |
| `validate` | 调用原生校验，并统一为 Promise |
| `resolveKeys` | 为展示值收集解析 value、label 和 children 字段 |

`customAdapter` 也可以与内置 `adapter` 同时存在，用于覆盖内置适配器的部分策略。

## 选项字段映射

```ts
resolveKeys(componentProps) {
  const fieldNames = componentProps?.fieldNames;
  if (!fieldNames) return null;
  return {
    valueKey: fieldNames.value ?? "value",
    labelKey: fieldNames.label ?? "label",
    childrenKey: fieldNames.children ?? "children",
  };
}
```

该方法服务于展示值收集。组件自身如何识别自定义选项字段，仍需使用组件库提供的原生属性。

## 组件值协议

当前 Render 向字段组件传递：

```tsx
modelValue={value}
onUpdate:modelValue={(value) => updateModel(value)}
```

如果目标组件使用 `value`、`checked` 或其他事件，需要提供一个轻量包装组件，将其转换成 `modelValue` 和 `update:modelValue`。只修改 Adapter 无法改变这一绑定协议。

## 布局契约

模板必须提供：

- `Item`：渲染默认插槽。
- `Group`：渲染默认插槽，可通过 `schema` 属性读取当前分组。
- `List`：渲染默认插槽和 `add` 插槽。
- `ListItem`：渲染默认插槽和 `delete` 插槽。

`add` 和 `delete` 插槽接收：

```ts
{ render: () => NativeButton }
```

Render 会将添加或删除行为附加到 `render()` 返回的组件上。

## 接入新 UI 库的验证顺序

1. 检查 Form 的 model 属性。
2. 检查 FormItem 的字段路径和 rules 契约。
3. 检查 Form 的 validate 返回方式。
4. 检查输入组件的 `modelValue` 协议。
5. 实现四种布局。
6. 验证 Input、Select、必填、跨字段校验、条件显隐和 List。
7. 使用 SSR 时，再配置字符串组件映射和请求动作。

不要因为一个 Input 能显示，就认为整个 UI 库已经完整适配。
