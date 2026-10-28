import { defineStore } from "pinia";

export const useLocaleStore = defineStore("locale", {
  state: () => ({
    // 故意使用和库内置 canonical key 不一致的写法（en-UK / cantonese），
    // 用来演示业务系统的 locale 命名可以借助 localeMap 归一化，不需要迁就库的命名
    locale: "zh-CN" as string,
  }),
  actions: {
    setLocale(locale: string) {
      this.locale = locale;
    },
  },
  persist: true,
});
