# 展示值与 Lookup

表单 model 通常保存选项的 value，但业务摘要或回显还需要对应的 label。Form 提供提交时展示值收集和字段级 Lookup 两种机制。

## 提交时收集展示值

```ts
const [Form, { submit }] = useForm({
  schemas,
  collectDisplayValues: true,
});

const { result, displayValues } = await submit();
```

例如 Select 的值为 `engineering`，选项 label 为“研发部”，结果可以是：

```json
{
  "result": {
    "department": "engineering"
  },
  "displayValues": {
    "department": {
      "label": "研发部",
      "value": "engineering"
    }
  }
}
```

Form 会检查 `componentProps` 中的对象数组，并按常见字段约定查找：

- `value` / `label` / `children`
- `key` / `title` / `children`
- `key` / `label` / `children`
- `id` / `name` / `children`

适配器可以通过 `resolveKeys` 提供额外映射。

## 树形标签模式

TreeSelect、Cascader 等层级数据支持 `labelMode`：

| 模式 | 结果 |
| --- | --- |
| `leaf` | 只保留选中项标签，默认 |
| `path` | 保留从根到选中项的完整标签数组 |
| `parent` | 保留直接父级和选中项 |

```ts
{
  component: TreeSelect,
  field: "organization",
  label: "所属组织",
  labelMode: "path",
  componentProps: { data: treeData },
}
```

结果示例：

```json
{
  "label": ["集团总部", "技术中心", "前端组"],
  "value": "tech-fe"
}
```

List 中的展示值会包含行索引路径。

## 自定义组件

组件可以暴露 `getDisplayValue()`。`useFormDisplayValue` 提供了统一封装：

```ts
import { defineComponent } from "vue";
import { useFormDisplayValue } from "@nuvzek/form";

export default defineComponent({
  props: {
    modelValue: { type: Number, default: 0 },
  },
  setup(props, { expose }) {
    useFormDisplayValue(
      () => props.modelValue,
      () => `计数：${props.modelValue}`,
      expose,
    );
  },
});
```

当普通选项收集无法识别组件时，Form 会尝试调用组件暴露的 `getDisplayValue()`。

## 字段级 Lookup

Lookup 适合在表单外实时展示已选内容或提供删除操作：

```ts
{
  component: Select,
  field: "gender",
  label: "性别",
  componentProps: {
    options: genderOptions,
    multiple: true,
  },
  lookup: raw({
    source: "options",
    match: "value",
    format: (matches) => matches.map((item) => item.label).join("、"),
  }),
}
```

- `source: "options"` 指向 `componentProps` 中的选项属性。
- `match` 是用于匹配 value 的字段路径或自定义函数。
- `format` 转换匹配结果。
- `valid` 可以过滤无效结果。
- `render` 可自定义外部展示。

读取结果：

```ts
const [Form, { getLookupResults, triggerLookup }] = useForm({ schemas });
const lookupResults = getLookupResults();
```

每个结果包含字段 `label`、`matchResult`、`delete` 和可选 `render`。`getLookupResults(path)` 只读取指定字段。

回填后或异步选项就绪后，可以调用 `triggerLookup()`。设置 `noAutoLookup: true` 可关闭 model 变化时的自动计算。

只需要提交时收集 label 时，优先使用 `collectDisplayValues`，不必为每个字段配置 Lookup。
