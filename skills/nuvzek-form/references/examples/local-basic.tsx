import { Input, InputNumber, Select } from "@arco-design/web-vue";
import { defineFormSchema } from "@nuvzek/form";

export default defineFormSchema([
  {
    component: Input,
    field: "employeeName",
    label: "员工姓名",
    required: true,
    span: 12,
  },
  {
    component: Select,
    field: "department",
    label: "部门",
    required: true,
    span: 12,
    componentProps: {
      options: [
        { label: "研发部", value: "engineering" },
        { label: "市场部", value: "marketing" },
      ],
    },
  },
  {
    type: "list",
    field: "workExperiences",
    label: "工作经历",
    minLen: 1,
    children: [
      {
        component: Input,
        field: "company",
        label: "公司",
        required: true,
      },
      {
        component: InputNumber,
        field: "years",
        label: "工作年限",
        componentProps: { min: 0 },
      },
    ],
  },
]);
