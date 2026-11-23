import { defineAsyncComponent, defineComponent, onBeforeMount, ref } from "vue";
import { version, useForm } from "@nuvzek/form";
import { Button } from "@arco-design/web-vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";

export default defineComponent({
  setup() {
    const devEnabled = import.meta.env.DEV;
    const devToolsEnabled = ref(devEnabled);
    if (devEnabled) import("@nuvzek/devtools/style.css");
    const DevTools = devEnabled
      ? defineAsyncComponent(() => import("@nuvzek/devtools").then((module) => module.FormDevTools))
      : null;

    function getSchemas() {
      return import("@/business/schemas/initial").then((res) => res.default);
    }

    const [Form, { submit, hydrate, share, getFormRef, getRuntime }] = useForm({
      debug: devEnabled,
      collectDisplayValues: true,
      schemas: getSchemas,
      formProps: {
        layout: "vertical",
      },
      namesToRemember: {
        namXX__e: "test.name",
        age: "test.age",
        nameOO: "test.nameOO",
      },
    });
    getRuntime().setDebug(devEnabled);

    hydrate({
      "test.name": [
        {
          "test.nameOO": "hello",
        },
        {
          "test.nameOO": "world",
        },
      ],
    });

    function handleSubmit() {
      submit().then((res: any) => {
        console.log(res);
      });
    }

    function toggleDevTools() {
      devToolsEnabled.value = !devToolsEnabled.value;
      getRuntime().setDebug(devToolsEnabled.value);
    }

    function fetchGenderOptions() {
      setTimeout(() => {
        share({
          genderOptions: [
            { label: "男", value: "male" },
            { label: "女", value: "female" },
          ],
        });
      }, 2000);
    }

    onBeforeMount(() => {
      fetchGenderOptions();
      hydrate({
        name: "A",
      });
    });

    const formRef = getFormRef();

    return () => (
      <>
        <PageContent title="基础示例">
          {{
            default: () => (
              <div class={styles.app}>
                <div>the nuvzek form version is {version}</div>
                <Form />
              </div>
            ),
            headerRight: () => (
              <>
                {import.meta.env.DEV && (
                  <Button onClick={toggleDevTools}>
                    {devToolsEnabled.value ? "关闭调试" : "调试"}
                  </Button>
                )}
                <Button type="primary" onClick={handleSubmit}>
                  提交
                </Button>
              </>
            ),
          }}
        </PageContent>
        {DevTools && devToolsEnabled.value && <DevTools runtime={getRuntime()} />}
      </>
    );
  },
});
