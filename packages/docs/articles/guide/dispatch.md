# Dispatch 与动态值

`$dispatch` 是纯 JSON Schema 的行为协议。它可以出现在 Schema 属性、`componentProps`、请求参数以及其他嵌套对象中。

## 动态值

| 写法 | 含义 |
| --- | --- |
| `$model.user.name` | 当前表单字段值 |
| `$shared.options` | 当前实例的共享状态 |
| `$args.0` | 事件处理中的第一个原生参数 |
| `$res.data` | 请求结果中的 `data` 属性 |
| `$err.message` | 请求错误中的 `message` 属性 |

精确匹配时返回原始值：

```json
{ "$dispatch": "SET_MODEL", "field": "city", "as": "$args.0" }
```

嵌在普通字符串中时进行插值：

```json
"备注：$model.name"
```

`null` 和 `undefined` 在插值时转换为空字符串。只写 `$model`、`$shared`、`$res`、`$err` 或 `$args` 不会得到整个对象，必须提供具体路径。

## 请求

支持 `GET`、`POST`、`PUT`、`DELETE` 和 `PATCH`：

```json
{
  "$dispatch": "GET",
  "target": "/api/departments",
  "params": { "keyword": "$model.keyword" },
  "data": {},
  "path": "data.list",
  "transform": {
    "method": "map",
    "relation": { "id": "value", "name": "label" }
  }
}
```

- `target` 交给宿主请求实现。
- `params` 通常用于查询参数，`data` 通常用于请求体。
- `path` 使用 lodash.get 风格语法提取响应。
- `transform.map` 将源字段复制成目标字段，原字段仍会保留。

### 将请求结果写入状态

推荐使用 `SET_SHARED` 或 `SET_MODEL` 包裹请求：

```json
{
  "$dispatch": "SET_SHARED",
  "field": "departmentOptions",
  "as": {
    "$dispatch": "GET",
    "target": "/api/departments",
    "path": "data"
  }
}
```

### 使用 `then` 和 `catch`

```json
{
  "$dispatch": "GET",
  "target": "/api/departments",
  "then": {
    "$dispatch": "SET_SHARED",
    "field": "departmentOptions",
    "as": "$res.data.list"
  },
  "catch": {
    "$dispatch": "SET_SHARED",
    "field": "requestError",
    "as": "$err.message"
  }
}
```

上例没有使用 `path`，所以 `$res.data.list` 相对于宿主的原始返回值。如果已经使用 `path: "data"` 提取出 `{ "list": [] }`，后续应写 `$res.list`，不再是 `$res.data.list`。

`then` 和 `catch` 可以是一个动作或动作数组。

## 条件

```json
{
  "component": "Textarea",
  "field": "highAmountReason",
  "label": "高额审批说明",
  "show": {
    "$dispatch": "CONDITION",
    "op": "gt",
    "left": "$model.amount",
    "right": 5000
  }
}
```

支持的操作符：

| 分类 | 操作符 |
| --- | --- |
| 相等与比较 | `eq`、`ne`、`gt`、`ge`/`gte`、`lt`、`le`/`lte` |
| 多值 | `between`、`not_between`、`in`、`not_in` |
| 字符串 | `like`、`not_like`、`like_left`、`not_like_left`、`like_right`、`not_like_right` |

多值操作符使用 `right` 数组或 `values` 数组：

```json
{
  "$dispatch": "CONDITION",
  "op": "in",
  "left": "$model.status",
  "right": ["pending", "approved"]
}
```

### And / Or

```json
{
  "$dispatch": "CONDITION",
  "and": [
    { "op": "eq", "left": "$model.country", "right": "CN" },
    { "op": "gt", "left": "$model.amount", "right": 1000 }
  ],
  "then": true,
  "else": false
}
```

将 `and` 换成 `or` 即可使用任一条件成立。条件求值会等待 Vue 的下一次 DOM 更新；动态条件重新计算时，目标属性可能短暂为 `undefined`。

## 事件管道

组件的 `onChange` 可以直接接收一个 Dispatch。需要多个动作时使用 `EVENT_HANDLER`：

```json
{
  "component": "Select",
  "field": "province",
  "label": "省份",
  "componentProps": {
    "options": [],
    "onChange": {
      "$dispatch": "EVENT_HANDLER",
      "pipes": [
        { "$dispatch": "SET_MODEL", "field": "city", "as": "" },
        {
          "$dispatch": "SET_SHARED",
          "field": "cityOptions",
          "as": {
            "$dispatch": "GET",
            "target": "/api/cities",
            "path": "data",
            "params": { "provinceCode": "$args.0" }
          }
        }
      ]
    }
  }
}
```

`$args.0` 通常比 `$model.province` 更直接，因为它就是本次事件收到的新值。

事件管道会依次启动各个动作，但不会把整组 pipes 当作等待所有异步动作完成的事务。不要让后续动作隐式依赖前一个异步动作已经完成。

## 状态读写

```json
{ "$dispatch": "SET_MODEL", "field": "user.name", "as": "张三" }
{ "$dispatch": "GET_MODEL", "field": "user.name" }
{ "$dispatch": "SET_SHARED", "field": "readonly", "as": true }
{ "$dispatch": "GET_SHARED", "field": "readonly" }
```

`SET_*` 的 `as` 可以是静态值、动态字符串或另一个 Dispatch。

## 组件实例

调用组件暴露的方法：

```json
{
  "$dispatch": "REFS",
  "field": "counter",
  "call": "increment",
  "args": []
}
```

读取组件暴露的属性：

```json
{
  "$dispatch": "REFS",
  "field": "counter",
  "get": "theRemark"
}
```

字段引用以表单字段路径为键。List 中的引用路径包含行索引。

## 国际化动作

```json
{
  "$dispatch": "I18N",
  "values": {
    "zh-CN": [{ "label": "男", "value": "male" }],
    "en-US": [{ "label": "Male", "value": "male" }]
  }
}
```

选中的分支可以继续包含动态值或其他 Dispatch。

## 自定义动作

宿主可以注册任意动作：

```ts
const ssr = {
  renderComponent,
  actions: {
    ALERT: ({ message }) => window.alert(message),
  },
};
```

JSON：

```json
{ "$dispatch": "ALERT", "message": "操作完成" }
```

自定义动作的名称必须与宿主注册名一致。动作的各个顶层输入会分别经过 Dispatch 或动态值处理。不要假设任意嵌套普通对象都会被递归求值；复杂深层结构应使用显式 Dispatch，或交由宿主动作处理。

## 自定义协议标记

宿主可以通过 `ssr.definitions` 覆盖默认标记：

```ts
definitions: {
  dispatch: "$dispatch",
  model: "$model",
  shared: "$shared",
  res: "$res",
  err: "$err",
  args: "$args",
}
```

同一份 Schema 和宿主运行时应使用一致的标记约定。
