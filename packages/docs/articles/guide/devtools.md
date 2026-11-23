# Form DevTools

Form DevTools 是独立的开发调试组件，位于 `@nuvzek/devtools`。它读取当前 Form Runtime，展示 model、Schema、依赖关系和 Dispatch 事件，不会自动注入到所有表单。

## 安装

```sh
pnpm add @nuvzek/devtools
```

## 初始化调试开关

推荐在初始化 Form 时统一设置，不使用 URL 参数：

```ts
app.use(initForm, {
  loader: () => import("./form-setup"),
  env: "web",
  debug: import.meta.env.DEV,
});
```

开发环境中各表单会默认记录调试事件，生产构建则关闭。单个 `useForm` 仍可通过自己的 `debug` 覆盖全局默认值。

组件和样式只在开发环境中加载：

```vue
<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { useForm } from "@nuvzek/form";

const devEnabled = import.meta.env.DEV;
const enabled = ref(devEnabled);

const [Form, { getRuntime }] = useForm({ schemas });

</script>

<template>
  <Form />
  <DevTools v-if="enabled" :runtime="getRuntime()" />
</template>
```

DevTools 组件和样式都通过动态 import 加载：

```ts
const DevTools = devEnabled
  ? defineAsyncComponent(() =>
      import("@nuvzek/devtools").then((module) => module.FormDevTools),
    )
  : null;

if (devEnabled) {
  import("@nuvzek/devtools/style.css");
}
```

如果需要在开发页面中通过按钮切换：

```ts
function toggleDevTools() {
  enabled.value = !enabled.value;
  getRuntime().setDebug(enabled.value);
}
```

## 面板内容

- `Model`：当前 model 和 shared，可复制 model。
- `Schema`：解析后的响应式 Schema。
- `Dependencies`：依赖来源、追踪路径和对应 Schema effect。
- `Dispatches`：请求、状态变化、依赖更新和 locale 事件。

请求事件包含 pending、fulfilled 或 rejected 状态，以及 target、参数、响应或错误。事件最多保留最近 50 条，并支持清空。

## 生产环境

生产构建中 `import.meta.env.DEV` 为 false，因此上述模式不会创建组件、执行动态 import 或注入样式。DevTools 是独立包，不属于 Form 主入口；未安装或未启用时不会产生调试面板。

`setDebug(false)` 会关闭事件记录并清空当前日志。不要仅依赖隐藏面板来停止调试记录。

其他构建工具应由应用提供等价的开发环境开关，不要直接照搬 `import.meta.env.DEV`。
