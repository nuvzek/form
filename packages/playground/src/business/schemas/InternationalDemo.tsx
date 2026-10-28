import { Input, Select } from "@arco-design/web-vue";
import { defineFormSchema, i18n } from "@nuvzek/form";

export default defineFormSchema([
  {
    // label 语义明确，原本就不支持 plain object，所以可以直接写词典字面量
    label: {
      "zh-CN": "姓名",
      "en-US": "Name",
      "zh-HK": "姓名",
    },
    field: "name",
    component: "Input",
    // required: true 触发的默认校验文案（{label}不能为空）也会跟着 locale 变化
    required: true,
  },
  {
    label: {
      "zh-CN": "性别",
      "en-US": "Gender",
      "zh-HK": "性別",
    },
    field: "gender",
    component: "Select",
    required: true,
    componentProps: {
      options: {
        $dispatch: "I18N",
        values: {
          "zh-CN": [
            { label: "男", value: "male" },
            { label: "女", value: "female" },
          ],
          "en-US": [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ],
          "zh-HK": [
            { label: "男", value: "male" },
            { label: "女", value: "female" },
          ],
        },
      },
      allowClear: true,
    },
  },
]);
