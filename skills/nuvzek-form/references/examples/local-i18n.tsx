import { Input, Select } from "@arco-design/web-vue";
import { defineFormSchema, i18n } from "@nuvzek/form";

export default defineFormSchema([
  {
    component: Input,
    field: "name",
    label: { "zh-CN": "姓名", "en-US": "Name", "zh-HK": "姓名" },
    placeholder: {
      "zh-CN": "请输入姓名",
      "en-US": "Please enter your name",
      "zh-HK": "請輸入姓名",
    },
    required: true,
  },
  {
    component: Select,
    field: "gender",
    label: { "zh-CN": "性别", "en-US": "Gender", "zh-HK": "性別" },
    required: true,
    componentProps: i18n({
      "zh-CN": {
        options: [
          { label: "男", value: "male" },
          { label: "女", value: "female" },
        ],
        allowClear: true,
      },
      "en-US": {
        options: [
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
        ],
        allowClear: true,
      },
      "zh-HK": {
        options: [
          { label: "男", value: "male" },
          { label: "女", value: "female" },
        ],
        allowClear: true,
      },
    }),
  },
]);
