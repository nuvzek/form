<div align="center">
  <img src="packages/docs/public/oasis.webp" width="104" alt="Nuvzek Form" />

  # Nuvzek Form

  **用一句话，创建一个真正可用的 Vue 表单。**

  Schema-driven forms for Vue 3 — local development, server-driven JSON, and an Agent Skill that handles the setup for you.

  [文档](https://nuvzek.github.io/form/) · [Skill 源码](skills/nuvzek-form/) · [提交 Issue](https://github.com/nuvzek/form/issues)

  <br />

  <a href="https://github.com/nuvzek/form/actions/workflows/docs.yml"><img src="https://github.com/nuvzek/form/actions/workflows/docs.yml/badge.svg" alt="Documentation deployment" /></a>
  <a href="https://www.npmjs.com/package/@nuvzek/form"><img src="https://img.shields.io/npm/v/@nuvzek/form" alt="npm version" /></a>
  <img src="https://img.shields.io/badge/Vue-3.5%2B-42b883" alt="Vue 3.5+" />
  <a href="https://github.com/nuvzek/form/blob/main/packages/form/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license" /></a>
</div>

<br />

## 从一个需求开始

不需要先学习 Schema，也不需要手动初始化 UI 适配器。安装 Skill 后，直接描述目标：

> 用 Element Plus 做一个员工入职表单，包含基本信息和可增删的工作经历。选择“其他”时显示补充说明，自动完成初始化并验证。

Skill 会自动检查项目、完成初始化、选择 Schema 模式、接入 UI 库并验证结果。项目已有配置会被保留和复用。

## 安装

### 作为 Agent Skill 使用

Kimi Code 支持直接从 GitHub 安装：

```text
/plugins install https://github.com/nuvzek/form
/reload
```

安装后可以直接用自然语言描述表单，也可以显式调用：

```text
/nuvzek-form:form 用 Element Plus 做一个员工入职表单，自动完成初始化和验证。
```

### 在其他 Agent Skills 客户端中使用

将 [`skills/nuvzek-form/`](skills/nuvzek-form/) 复制或链接到客户端支持的 Skill 目录。核心目录只使用标准 Agent Skills 元数据、相对路径和 Node.js 脚本，不依赖 Kimi 专属占位符。

### 只使用 Vue 表单库

```sh
pnpm add @nuvzek/form
```

然后根据项目使用的组件库完成模板配置。内置支持 Arco Design、Naive UI 和 NutUI，也可以通过 `customAdapter` 接入其他 Vue 组件库。

[阅读快速开始 →](https://nuvzek.github.io/form/articles/guide/getting-started)

## 提问示例

```text
帮我在当前 Vue 项目里创建一个员工入职表单。
```

```text
用 Element Plus 做一个报销审批表单，包含发票列表，自动完成接入和验证。
```

```text
给注册页增加手机号和验证码，两次密码不一致时不能提交。
```

```text
只生成 BPM 页面可使用的 SSR JSON Schema，不要修改页面。
```

```text
参考这张截图实现表单，沿用当前组件库，并说明图片无法确定的业务规则。
```

如果请求缺少必要信息，Skill 只询问会影响结果的选择，例如表单用途、UI 库或交付形式；已有答案不会被重复询问。

## 两种表单模式

| 模式 | 适合场景 | 组件写法 |
| --- | --- | --- |
| 本地 TS/TSX Schema | Vue 页面、复杂校验、自定义组件和业务交互 | 直接使用导入的 Vue 组件 |
| SSR JSON Schema | 服务端下发、低代码编辑器、远程表单和 AI 动态生成 | 字符串组件名与 `$dispatch` |

### 本地 Schema

```ts
const [Form, { submit }] = useForm({
  schemas: [
    {
      component: Input,
      field: "name",
      label: "姓名",
      required: true,
    },
  ],
});
```

### SSR JSON

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

SSR 模式由宿主提供组件映射和请求实现；Dispatch 支持请求、条件显隐、事件管道、状态读写、组件引用和国际化。

[了解本地 Schema →](https://nuvzek.github.io/form/articles/guide/schema) · [了解 SSR JSON →](https://nuvzek.github.io/form/articles/guide/ssr)

## Skill 会坚持什么

- 默认交付可运行代码，而不是只给一段 Schema。
- 自动完成必要的初始化和陌生 UI 库适配。
- 原生 rules、组件事件和 Slots 遵循目标 UI 库，不伪造统一 DSL。
- 没有接口时使用静态选项，不虚构 API。
- 只询问影响业务正确性或交付目标的问题。
- 验证真实运行时、请求和交互，不把“构建通过”当成“表单可用”。

## 验证与项目结构

运行 Skill、Schema 校验器和文档体验测试：

```sh
pnpm test:skill
```

准备一个不污染原始 fixture 的空白 Vue 项目：

```sh
node e2e/prepare-blank.mjs /tmp/nuvzek-form-e2e
```

完整的陌生 UI 库接入场景见 [`e2e/scenarios/element-plus.md`](e2e/scenarios/element-plus.md)。

```text
packages/form        Form 核心运行时
packages/docs        VitePress 文档
packages/playground  示例与 AI 表单编辑器
packages/blank       空白 Vue E2E fixture
skills/nuvzek-form   跨客户端 Agent Skill
```

<div align="center">
  <br />
  <sub>MIT © Nuvzek · Built for forms that need to work, not just render.</sub>
</div>
