# Runtime 与数据流

## `useForm`

```ts
const [Form, controls] = useForm(options);
```

每个 `useForm` 创建独立 Runtime，model、shared、lookup 和 locale 都在当前实例中。

### 常用配置

| 配置 | 作用 |
| --- | --- |
| `schemas` | 数组、返回数组的函数或异步函数 |
| `templateId` | 覆盖全局默认模板 |
| `formProps` | 原生 Form 属性 |
| `formSlots` | 原生 Form 插槽 |
| `layoutGap` | 普通字段布局间距 |
| `listLayoutGap` | List 行内布局间距 |
| `ssr` | 纯 JSON 的组件映射、动作和协议定义 |
| `namesToRemember` | 提交和回填时转换字段名 |
| `collectDisplayValues` | 提交时额外收集展示值 |
| `noAutoLookup` | 禁止 model 变化时自动执行 lookup |
| `locale` | 普通字符串、ref、computed 或 getter |
| `localeMap` | 将业务语言标记映射为 Form 使用的语言 |
| `fallbackLocale` | 找不到当前语言时的兜底语言 |
| `messages` | 扩展或覆盖内置提示文案 |

### 控制器

| 控制器 | 作用 |
| --- | --- |
| `submit()` | 校验并返回表单结果 |
| `model` | 当前响应式 model 的 ref |
| `schemas` | 解析后的响应式 Schema |
| `share(value)` | 合并当前实例的共享状态 |
| `isReady(callback)` | 等待字段和默认值初始化完成 |
| `hydrate(data)` | 等待 ready 后回填数据 |
| `getFormRef()` | 获取原生 Form 组件引用 |
| `getLookupResults(path?)` | 获取全部或指定字段的 lookup 结果 |
| `triggerLookup()` | 主动重新计算全部 lookup |
| `updateForm(options)` | 使用新 Schema 重建表单 |
| `locale` | 当前归一化语言的只读 computed |

## 初始化完成

异步字段、异步默认值和异步组件会影响初始化时机：

```ts
const [Form, { isReady, getFormRef }] = useForm({ schemas });

isReady(() => {
  // 此时字段和默认值已完成初始化
});
```

`isReady` 在条件满足后通过 `setTimeout(0)` 调用回调，并在后续 nextTick 停止监听。

## 回填

```ts
const [Form, { hydrate }] = useForm({ schemas });

await hydrate({
  name: "张三",
  department: "engineering",
});
```

`hydrate` 会自行等待表单 ready，然后按顶层 key 合并数据。嵌套对象应提供完整的对应结构；List 可以直接回填数组。

## 字段名映射

当业务接口字段名与内部字段名不同时：

```ts
const [Form, { submit, hydrate }] = useForm({
  schemas,
  namesToRemember: {
    name: "fullName",
  },
});

await hydrate({ fullName: "张三" });
const result = await submit();
// result.fullName
```

映射会递归应用于对象和数组中的同名 key。

## 共享状态

```ts
const [Form, { share }] = useForm({ schemas });

share({ readonly: true });
```

动态 Schema 中读取：

```ts
componentProps: {
  disabled: ({ shared }: any) => shared.readonly,
}
```

SSR JSON 则使用 `$shared.readonly` 或 `GET_SHARED`。

## 获取原生 Form

```ts
const formRef = getFormRef();
formRef.value?.validate();
```

需要直接调用组件库能力时可以使用它。常规提交优先使用 `submit()`，以保持适配器行为一致。

## 替换整个表单

```ts
updateForm({ schemas: nextSchemas });
```

`updateForm` 会合并新的 options，并清空旧 model、shared、lookup、refs 和依赖追踪，然后重新解析 Schema。它适用于远程编辑器和 AI 预览，不是保留旧值的增量更新。
