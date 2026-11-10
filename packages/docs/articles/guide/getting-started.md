# 快速开始

下面用 Arco Design 创建一个可提交的基础表单。其他组件库需要先完成对应的[适配器配置](./adapters)。

## 安装依赖

```sh
pnpm add @nuvzek/form @arco-design/web-vue
```

在已有 Vue 3 项目中执行即可。根据项目实际情况，将 `pnpm` 换成 npm 或 yarn。

## 注册组件库和 Form

修改 `main.ts`：

```ts
import { createApp } from "vue";
import ArcoVue from "@arco-design/web-vue";
import { initForm } from "@nuvzek/form";
import "@arco-design/web-vue/dist/arco.css";
import App from "./App.vue";

const app = createApp(App);

app
  .use(ArcoVue)
  .use(initForm, {
    loader: () => import("./form-setup"),
    env: "web",
  })
  .mount("#app");
```

`initForm` 会在应用挂载前加载表单模板。`loader` 必须返回一个包含默认导出的模块。

## 提供布局组件

Form 不规定页面布局样式。模板需要提供 Item、Group、List 和 ListItem 四种布局。

创建 `form-layouts.ts`：

```ts
import { Button } from "@arco-design/web-vue";
import { defineComponent, h } from "vue";

export const Item = defineComponent({
  setup(_, { slots }) {
    return () => h("div", slots.default?.());
  },
});

export const Group = defineComponent({
  setup(_, { slots }) {
    return () => h("div", slots.default?.());
  },
});

export const List = defineComponent({
  setup(_, { slots }) {
    return () =>
      h("section", [
        slots.add?.({
          render: () => h(Button, { type: "primary" }, () => "添加"),
        }),
        slots.default?.(),
      ]);
  },
});

export const ListItem = defineComponent({
  setup(_, { slots }) {
    return () =>
      h("div", [
        slots.default?.(),
        slots.delete?.({
          render: () => h(Button, { type: "text" }, () => "删除"),
        }),
      ]);
  },
});
```

List 的 `add` 和 ListItem 的 `delete` 插槽接收 `{ render }`。Render 会把实际点击行为附加到 `render()` 返回的按钮上。

## 配置模板

创建 `form-setup.ts`：

```ts
import { defineFormSetup } from "@nuvzek/form";
import { Form, FormItem } from "@arco-design/web-vue";
import { Item, Group, List, ListItem } from "./form-layouts";

export default defineFormSetup({
  templates: [
    {
      id: "basic",
      adapter: "ArcoVue",
      providers: {
        Form,
        FormItem,
        layouts: { Item, Group, List, ListItem },
      },
    },
  ],
  default: {
    templateId: "basic",
    layoutGap: 16,
  },
});
```

`templates` 允许配置多套模板。`default.templateId` 指定未显式传 `templateId` 时使用的模板。

## 创建表单

修改 `App.vue`：

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Input, Select } from "@arco-design/web-vue";
import { useForm } from "@nuvzek/form";

const [Form, { submit }] = useForm({
  formProps: { layout: "vertical" },
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
      required: true,
      componentProps: {
        options: [
          { label: "研发部", value: "engineering" },
          { label: "市场部", value: "marketing" },
        ],
      },
    },
  ],
});

const result = ref("");

async function handleSubmit() {
  try {
    result.value = JSON.stringify(await submit(), null, 2);
  } catch (errors) {
    // 校验失败：保留用户输入，并按需展示业务提示
  }
}
</script>

<template>
  <Form />
  <Button type="primary" @click="handleSubmit">提交</Button>
  <pre v-if="result">{{ result }}</pre>
</template>
```

`useForm` 返回一个 Vue 组件和一组控制器。模板中的 `<Form />` 不需要额外注册。

`submit()` 会先调用当前适配器的校验方法。校验成功后返回当前 model；失败时返回 rejected Promise，应在实际业务中处理错误。

## 下一步

- 学习[字段、分组、列表和动态属性](./schema)。
- 配置[必填和跨字段校验](./validation)。
- 查看[提交、回填和 Runtime 控制器](./runtime)。
- 需要纯 JSON 时，阅读[SSR JSON](./ssr)。
