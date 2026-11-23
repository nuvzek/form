# @nuvzek/form

面向 Vue 3 的配置式表单运行时。使用本地 Schema 开发页面，或通过纯 JSON 和 Dispatch 渲染服务端下发的表单。

[完整文档](https://nuvzek.github.io/form/) · [GitHub](https://github.com/nuvzek/form) · [快速开始](https://nuvzek.github.io/form/articles/guide/getting-started)

## 安装

```sh
pnpm add @nuvzek/form
```

要求 Vue `^3.5.13`。Form 还需要一个 UI 模板：可以使用内置的 Arco Design、Naive UI 或 NutUI 适配器，也可以通过 `customAdapter` 接入其他 Vue 组件库。

## 初始化

```ts
import { createApp } from "vue";
import { initForm } from "@nuvzek/form";
import App from "./App.vue";

const app = createApp(App);

app.use(initForm, {
  loader: () => import("./form-setup"),
  env: "web",
  debug: import.meta.env.DEV,
});

app.mount("#app");
```

`form-setup` 通过 `defineFormSetup` 提供 Form、FormItem、布局及适配器。完整配置见[快速开始](https://nuvzek.github.io/form/articles/guide/getting-started)。

## 本地 Schema

```vue
<script setup lang="ts">
import { Input, Select } from "@arco-design/web-vue";
import { useForm } from "@nuvzek/form";

const [Form, { submit }] = useForm({
  schemas: [
    {
      component: Input,
      field: "name",
      label: "姓名",
      required: true,
    },
    {
      component: Select,
      field: "department",
      label: "部门",
      componentProps: {
        options: [
          { label: "研发部", value: "engineering" },
          { label: "市场部", value: "marketing" },
        ],
      },
    },
  ],
});
</script>

<template>
  <Form />
  <button @click="submit">提交</button>
</template>
```

本地 Schema 支持动态函数、异步默认值、条件显隐、跨字段校验、Group、List、回填和自定义业务组件。

[本地 Schema 文档 →](https://nuvzek.github.io/form/articles/guide/schema)

## 纯 JSON SSR

```json
[
  {
    "component": "Input",
    "field": "name",
    "label": "姓名",
    "required": true
  }
]
```

宿主通过 `ssr.renderComponent` 将字符串组件名映射为真实组件，并通过 `ssr.actions` 提供 GET、POST 等请求实现。

```ts
const [Form, { submit }] = useForm({
  schemas,
  ssr: {
    renderComponent,
    actions: {
      GET: ({ target, params }) => http.get(target, { params }),
      POST: ({ target, data }) => http.post(target, data),
    },
  },
});
```

Dispatch 支持请求、条件、事件管道、状态读写、组件引用和国际化。详见 [SSR JSON](https://nuvzek.github.io/form/articles/guide/ssr) 与 [Dispatch](https://nuvzek.github.io/form/articles/guide/dispatch)。

## Runtime 能力

- `submit()`：原生校验并提交 model。
- `hydrate()`：等待初始化完成后回填数据。
- `share()`：更新跨字段共享状态。
- `updateForm()`：使用新 Schema 重建表单。
- `getLookupResults()`：读取字段展示匹配结果。
- `collectDisplayValues`：提交时额外收集 label 和树形路径。
- `namesToRemember`：提交和回填时转换字段名。
- `debug` 与 `getRuntime()`：为开发调试提供 Runtime 状态。

## Form DevTools

独立的 `@nuvzek/devtools` 包提供 Model、Schema、Dependencies 和 Dispatches 调试面板。它只在开发环境按需加载，生产构建不会包含调试面板。

[DevTools 使用文档 →](https://nuvzek.github.io/form/articles/guide/devtools)

## 许可证

MIT
