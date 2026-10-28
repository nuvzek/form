import { Input } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@nuvzek/form";

export default defineFormSchema([
  {
    label: "姓名",
    field: "name",
    component: Input,
    formItemProps: {
      tooltip: "hello",
    },
    formItemSlots: {
      extra: () => "hi extra",
    },
    required: "Test",
  },
]);
