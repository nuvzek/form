import { defineComponent } from "vue";
import { version, useForm } from "@nuvzek/form";
import { Button, RadioGroup, Radio } from "@arco-design/web-vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";
import { useLocaleStore } from "@/store/locale";
import { storeToRefs } from "pinia";
import Counter from "@/components/Counter";
import axios from "axios";

export default defineComponent({
  setup() {
    console.log("the nuvzek form version is", version);

    const localeStore = useLocaleStore();
    const { locale } = storeToRefs(localeStore);

    function getSchemas() {
      return import("@/business/schemas/InternationalDemo").then(
        (res) => res.default,
      );
    }

    const [Form, { submit, locale: resolvedLocale }] = useForm({
      ssr: {
        renderComponent(componentName: string) {
          return import(`@arco-design/web-vue`).then((res) => {
            return { ...res, Counter }[componentName];
          });
        },
        actions: {
          GET: ({ target, path, params }: any) => {
            return axios.get(target, { params });
          },
          POST: ({ target, path, data }: any) => {
            return axios.post(target, data);
          },
        },
      },
      schemas: getSchemas,
      formProps: {
        layout: "vertical",
      },
      // 直接把 pinia store 里的 ref 传进来，store 的值一变，表单里所有用到词典的字段都会自动刷新
      locale,
      // 业务系统里的 locale 命名和库内置的 canonical key 并不一致（en-UK / cantonese），
      // 通过 localeMap 做一次归一化即可，不需要迁就库的命名
      localeMap: {
        "en-UK": "en-US",
        cantonese: "zh-HK",
      },
    });

    function handleSubmit() {
      submit().then((res: any) => {
        console.log(res);
      });
    }

    return () => (
      <PageContent title="国际化示例">
        {{
          default: () => (
            <div class={styles.app}>
              <div>the nuvzek form version is {version}</div>
              <div class={styles.localeSwitcher}>
                <span class={styles.localeSwitcherLabel}>切换 locale：</span>
                <RadioGroup
                  type="button"
                  modelValue={locale.value}
                  onUpdate:modelValue={(value) =>
                    localeStore.setLocale(value as string)
                  }
                >
                  <Radio value="zh-CN">简体中文（zh-CN）</Radio>
                  <Radio value="en-UK">English（en-UK）</Radio>
                  <Radio value="cantonese">粵語（cantonese）</Radio>
                </RadioGroup>
                <span class={styles.localeSwitcherHint}>
                  归一化后的 canonical locale：{resolvedLocale.value}
                </span>
              </div>
              <Form />
            </div>
          ),
          headerRight: () => (
            <>
              <Button type="primary" onClick={handleSubmit}>
                提交
              </Button>
            </>
          ),
        }}
      </PageContent>
    );
  },
});
