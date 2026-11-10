# 常见问题

## 页面没有渲染任何字段

先检查：

1. 是否已在应用挂载前注册 `initForm`。
2. `loader` 是否返回带默认导出的 `defineFormSetup` 模块。
3. `default.templateId` 是否指向实际存在的模板。
4. 模板是否提供 Form、FormItem 和四种布局。
5. 异步 Schema 是否成功返回数组。

## SSR 字符串组件不显示

本地 Schema 直接传组件对象；SSR JSON 使用字符串。SSR 模式必须提供 `ssr.renderComponent`，并确保它能返回 JSON 中每个组件名对应的真实组件。

```ts
renderComponent: async (name) => componentMap[name]
```

组件名不一致或映射返回 `undefined` 时，字段不会正常渲染。

## 输入后 model 没有更新

当前字段组件需要支持：

```text
modelValue + update:modelValue
```

如果组件使用 `value`、`checked` 或其他事件，添加包装组件进行转换。只修改 Adapter 的 `formModelName` 不能解决输入组件的值协议差异。

## 必填或自定义校验没有执行

检查：

- FormItem 的字段路径属性是否由 `formModelKey` 正确映射。
- 字段是否有正确的 `field`。
- `rules` 是否符合当前 UI 库的原生格式。
- 自定义 Adapter 的 `validate` 是否真正调用了原生 Form 校验。
- 当前字段是否因 `show: false` 而没有渲染。

不要将 Arco 的 validator 签名直接用于其他 UI 库。

## 事件函数在解析阶段就被执行了

普通 Schema 函数用于动态属性，会被 Form 立即执行。组件事件需要用 `raw` 保留：

```ts
componentProps: {
  onChange: raw((utils: any, value: any) => {
    // 事件发生时执行
  }),
}
```

纯 JSON 中使用 `EVENT_HANDLER` 或具体 Dispatch，不要写函数。

## 动态条件短暂变成 `undefined`

SSR `CONDITION` 和其他异步 Schema 属性会先经历中间状态，再写入最终结果。测试和后续逻辑应等待异步求值完成，不要把中间状态当成最终结果。

## `$res` 没有取到请求数据

`$res` 必须带具体路径。路径相对于经过请求 `path` 和 `transform` 处理后的结果。

例如请求使用 `path: "data"` 后得到 `{ "list": [] }`，应写 `$res.list`，不是 `$res.data.list`。

需要将完整请求结果写入状态时，优先使用：

```json
{
  "$dispatch": "SET_SHARED",
  "field": "options",
  "as": {
    "$dispatch": "GET",
    "target": "/api/options",
    "path": "data"
  }
}
```

## List 新增行为空或报错

等待 `isReady` 后再添加。新增行依赖初始化完成后保存的默认值模板。同时检查：

- List 是否有 `field`。
- 子字段是否使用相对路径。
- 子字段的异步默认值是否已经完成。
- List 和 ListItem 是否正确实现 `add`、`delete` 插槽。

## 切换语言后部分内容没有更新

- `label`、`placeholder`、`required` 可以直接使用词典。
- 本地其他配置使用 `i18n()`。
- SSR 其他动态值使用 `I18N`。
- 语言来源需要是响应式 ref、computed 或 getter。
- 词典 key 应使用经过 `localeMap` 归一化后的语言名称。

## `displayValues` 缺少某个字段

确认 `useForm` 已开启 `collectDisplayValues: true`，并检查：

- 当前值是否存在于选项或树数据中。
- 选项是否已经完成异步加载。
- value/label/children 字段是否符合常见约定或 Adapter 的 `resolveKeys`。
- 自定义组件是否暴露 `getDisplayValue()`。

Lookup 与 `collectDisplayValues` 是两套不同机制，仅配置 Lookup 不会改变 `submit()` 的返回结构。
