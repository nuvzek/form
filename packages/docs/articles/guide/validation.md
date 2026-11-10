# 校验与提交

## 必填字段

```ts
{
  component: Input,
  field: "name",
  label: "姓名",
  required: true,
}
```

`required: true` 会生成当前 UI 库使用的 `{ required: true, message }` 规则。默认提示跟随表单 locale。

自定义必填提示：

```ts
required: "请填写姓名"
```

## 原生规则

`rules` 会传给当前 FormItem，不会被转换成跨组件库的统一格式。下面是 Arco Design 的自定义校验示例：

```ts
{
  component: Input,
  field: "phone",
  label: "手机号",
  required: true,
  rules: [
    {
      validator: (value: string, callback: (error?: string) => void) => {
        if (!/^1\d{10}$/.test(value)) callback("请输入正确的手机号");
        else callback();
      },
    },
  ],
}
```

Naive UI、NutUI、Element Plus 和其他组件库的 validator 签名可能不同，应按实际安装版本编写。

## 跨字段校验

Schema 函数可以读取当前 model，因此确认密码规则可以动态依赖密码字段：

```ts
{
  component: Input,
  field: "confirmPassword",
  label: "确认密码",
  required: true,
  componentProps: { type: "password" },
  rules: ({ model }: any) => [
    {
      validator: (value: string, callback: (error?: string) => void) => {
        if (value !== model.password) callback("两次密码不一致");
        else callback();
      },
    },
  ],
}
```

这里仍然使用 Arco 的 validator 契约。Form 提供的是动态读取 model 的能力，不是统一的 validator 类型。

## 条件必填与隐藏字段

`required` 和 `show` 都可以动态计算：

```ts
{
  component: Input,
  field: "otherReason",
  label: "其他原因",
  show: ({ model }: any) => model.reason === "other",
  required: ({ model }: any) => model.reason === "other",
}
```

`show: false` 只是不渲染字段，不会自动清空它已经存在的 model 值。如果业务要求切换选项时清除数据，应在事件处理或提交前显式处理。

## 提交

```ts
const [Form, { submit }] = useForm({ schemas });

async function handleSubmit() {
  try {
    const model = await submit();
    // 使用校验后的 model
  } catch (errors) {
    // 当前 UI 库返回的校验错误
  }
}
```

`submit()` 先调用适配器的 `validate()`，校验失败时 reject，不会返回一个“校验失败但可用”的 model。

开启 `collectDisplayValues` 后，返回结构变为：

```ts
const { result, displayValues } = await submit();
```

详见[展示值与 Lookup](./display-values)。

## 纯 JSON 的限制

SSR JSON 无法携带 `validator` 函数。可以使用 JSON 能表达的原生声明式规则，或者由宿主注册自定义能力。复杂客户端校验更适合本地 Schema。
