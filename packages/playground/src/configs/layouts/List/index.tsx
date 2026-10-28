import { defineComponent } from "vue";
import styles from "./index.module.scss";
import { Button } from "@arco-design/web-vue";

export default defineComponent({
  props: {},
  setup(props, { slots }) {
    return () => (
      <div class={styles.list}>
        <div class={styles.header}>
          {slots.add?.({
            render: () => (
              <Button class={styles.addButton} type="primary">
                添加
              </Button>
            ),
          })}
        </div>
        <div class={styles.content}>{slots.default?.()}</div>
      </div>
    );
  },
});
