# 简介

Nuvzek Form 是一个面向 Vue 3 的配置式表单运行时。你使用 Schema 描述字段、布局、校验和联动，Form 负责初始化模型、追踪依赖、渲染组件以及提交校验。

## 两种使用方式

| 方式 | 组件写法 | 适用场景 |
| --- | --- | --- |
| 本地 Schema | 直接传入导入的 Vue 组件 | 在 Vue 项目中开发页面，需要函数、JSX、自定义校验和复杂交互 |
| SSR JSON Schema | 使用字符串组件名和 `$dispatch` | 服务端下发 Schema、低代码编辑器、远程表单和动态更新 |

本地 Schema 是常规开发的首选。需要把表单保存为纯 JSON 时，使用 [SSR JSON](./ssr)。

## 核心能力

- 普通字段、分组和可增删列表。
- 同步或异步 Schema 属性。
- 基于 `model`、`shared` 和 `locale` 的依赖追踪。
- 字段显隐、动态组件、动态属性和跨字段校验。
- Arco Design、Naive UI、NutUI 适配器，以及自定义 UI 库适配。
- 表单回填、字段名映射、展示值收集和组件实例访问。
- 纯 JSON 请求、条件、事件管道和状态读写。

## 工作流程

```text
initForm 加载全局模板
  → useForm 创建表单 Runtime
  → Schema 解析字段和动态属性
  → Model 初始化数据
  → Update 追踪依赖变化
  → Render 通过适配器渲染
  → submit 校验并返回结果
```

## 需要理解的边界

Form 统一的是模型、字段路径、校验调用和渲染流程，不会统一不同 UI 库的原生 API。

`componentProps`、`componentSlots`、事件参数和自定义 `rules` 仍然遵循当前组件库。不要把 Arco 的 validator 或组件属性直接复制到 Naive UI、NutUI 或其他组件库。

纯 JSON 不能包含函数或 JSX。需要任意客户端校验函数时，使用本地 Schema，或者由宿主程序注册自定义能力。

## 环境要求

- Vue `^3.5.13`
- 一个 Vue 组件库，或项目自己的 Form、FormItem 和输入组件
- TypeScript 不是运行时的硬性要求，但仓库示例使用 TypeScript

下一步：[快速开始](./getting-started)。
