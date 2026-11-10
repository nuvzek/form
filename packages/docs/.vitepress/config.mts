import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "zh-CN",
  base: "/form/",
  title: "Nuvzek Form",
  description: "面向 Vue 3 的配置式表单运行时",
  themeConfig: {
    nav: [
      { text: "开发指南", link: "/articles/guide/getting-started" },
      { text: "SSR JSON", link: "/articles/guide/ssr" },
      { text: "Runtime API", link: "/articles/guide/runtime" },
    ],

    sidebar: [
      {
        text: "开始",
        items: [
          { text: "简介", link: "/articles/guide/introduction" },
          { text: "快速开始", link: "/articles/guide/getting-started" },
        ],
      },
      {
        text: "开发表单",
        items: [
          { text: "Schema 与动态属性", link: "/articles/guide/schema" },
          { text: "校验与提交", link: "/articles/guide/validation" },
          { text: "Runtime 与数据流", link: "/articles/guide/runtime" },
          { text: "UI 库与适配器", link: "/articles/guide/adapters" },
        ],
      },
      {
        text: "纯 JSON",
        items: [
          { text: "SSR JSON Schema", link: "/articles/guide/ssr" },
          { text: "Dispatch 与动态值", link: "/articles/guide/dispatch" },
        ],
      },
      {
        text: "高级能力",
        items: [
          { text: "国际化", link: "/articles/guide/internationalization" },
          { text: "展示值与 Lookup", link: "/articles/guide/display-values" },
          { text: "常见问题", link: "/articles/guide/troubleshooting" },
        ],
      },
    ],

    outline: { label: "本页目录" },
    docFooter: { prev: "上一页", next: "下一页" },
    socialLinks: [{ icon: "github", link: "https://github.com/nuvzek/form" }],
  },
});
