# 纯 JSON SSR Schema

SSR 模式让宿主程序直接消费纯 JSON Schema。组件使用字符串名称，动态行为使用 `$dispatch`，因此 Schema 可以保存在数据库、由接口返回或在编辑器中修改。

这里的 SSR 指可序列化 Schema 运行时，不只是服务端生成 HTML。

## 最小 JSON

```json
[
  {
    "component": "Input",
    "field": "name",
    "label": "姓名",
    "required": true
  },
  {
    "component": "Select",
    "field": "department",
    "label": "部门",
    "required": true,
    "componentProps": {
      "options": [
        { "label": "研发部", "value": "engineering" },
        { "label": "市场部", "value": "marketing" }
      ]
    }
  }
]
```

JSON 的字段、分组、列表和布局概念与本地 Schema 相同。List 子字段仍使用相对路径。

## 注册全局模板

SSR 不会省略全局初始化。宿主仍需通过 `initForm` 和 `defineFormSetup` 提供 Form、FormItem、适配器及布局。请先完成[快速开始](./getting-started)中的配置。

## 提供组件映射

`renderComponent` 把 JSON 中的字符串转换成真实 Vue 组件：

```vue
<script setup lang="ts">
import { useForm } from "@nuvzek/form";
import schemas from "./schema.json";

const [Form] = useForm({
  schemas,
  ssr: {
    async renderComponent(componentName: string) {
      const components = await import("@arco-design/web-vue");
      return components[componentName as keyof typeof components];
    },
    actions: {},
  },
});
</script>

<template>
  <Form />
</template>
```

组件名由宿主控制。可以只暴露允许的组件，也可以映射到业务组件：

```ts
const componentMap = {
  Input: ArcoInput,
  DepartmentSelect,
  Counter,
};

async function renderComponent(name: string) {
  return componentMap[name];
}
```

未映射的组件无法正常渲染。生产环境不建议不加限制地暴露整个组件库。

## 从接口加载 Schema

`schemas` 支持异步函数：

```ts
const [Form] = useForm({
  schemas: async () => {
    const response = await fetch("/api/form/employee");
    return response.json();
  },
  ssr,
});
```

接口应直接返回 Schema 数组，或在业务代码中提取数组后再返回。

## 请求实现

JSON 只声明请求，不自带 HTTP 客户端。宿主通过 `ssr.actions` 提供执行能力：

```ts
import axios from "axios";

const ssr = {
  renderComponent,
  actions: {
    GET: ({ target, params }) => axios.get(target, { params }),
    POST: ({ target, data }) => axios.post(target, data),
    PUT: ({ target, data }) => axios.put(target, data),
    DELETE: ({ target, params }) => axios.delete(target, { params }),
    PATCH: ({ target, data }) => axios.patch(target, data),
  },
};
```

对应 JSON：

```json
{
  "component": "Select",
  "field": "department",
  "label": "部门",
  "componentProps": {
    "options": {
      "$dispatch": "GET",
      "target": "/api/departments",
      "path": "data",
      "transform": {
        "method": "map",
        "relation": { "id": "value", "name": "label" }
      }
    }
  }
}
```

`path` 相对于宿主 HTTP 方法的原始返回值。如果请求拦截器已经返回 `response.data`，Schema 中的 `path` 就要以拦截器返回值为起点。

## 动态更新整个表单

编辑器或 AI 生成新的 JSON 后，可以调用 `updateForm`：

```ts
const [Form, { updateForm }] = useForm({ schemas: initialSchemas, ssr });

function applySchema(schemas) {
  updateForm({ schemas, ssr });
}
```

`updateForm` 会重建 Schema，并重置 model、shared、lookup、refs 和依赖追踪。旧表单值不会自动保留。

## JSON 的限制

JSON 中不能写：

- 函数或原生 validator 闭包。
- JSX。
- Vue 组件对象。
- `raw()` 或 `once()` 调用。
- 未在宿主注册的自定义动作。

这些限制使 Schema 保持可序列化。需要自由编写函数时，请使用[本地 Schema](./schema)。

## 下一步

阅读 [Dispatch 与动态值](./dispatch)，了解请求、条件、事件管道、共享状态和组件实例调用。
