import { Input, Select, Textarea } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@nuvzek/form";

export default defineFormSchema([
  {
    component: Select,
    field: "reason",
    label: "申请原因",
    required: true,
    componentProps: {
      options: [
        { label: "事假", value: "personal" },
        { label: "其他", value: "other" },
      ],
      onChange: raw((utils: any, value: any) => {
        utils.share({ selectedReason: value });
      }),
    },
  },
  {
    component: Textarea,
    field: "otherReason",
    label: "其他原因说明",
    required: true,
    show: ({ model }: any) => model.reason === "other",
  },
  {
    component: Input,
    field: "password",
    label: "密码",
    required: true,
    componentProps: { type: "password" },
  },
  {
    component: Input,
    field: "confirmPassword",
    label: "确认密码",
    required: true,
    componentProps: { type: "password" },
    rules: ({ model }: any) => [
      {
        validator: (value: any, callback: (error?: string) => void) => {
          if (value !== model.password) callback("两次密码不一致");
          else callback();
        },
      },
    ],
  },
]);
