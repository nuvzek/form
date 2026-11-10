<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { withBase } from "vitepress";

const demos = {
  local: {
    label: "本地 Schema",
    file: "schema.ts",
    title: "在 Vue 项目里直接开发",
    description: "使用项目已有的组件，编写动态函数、原生校验和业务交互。",
    link: "/articles/guide/schema",
    linkText: "阅读本地开发指南",
    code: `{
  component: Input,
  field: "name",
  label: "姓名",
  required: true,
  show: ({ model }) => model.enabled
}`,
  },
  ssr: {
    label: "纯 JSON SSR",
    file: "schema.json",
    title: "让表单由数据驱动",
    description: "将 Schema 保存在服务端，由宿主映射组件并执行 Dispatch。",
    link: "/articles/guide/ssr",
    linkText: "了解 SSR JSON",
    code: `{
  "component": "Input",
  "field": "name",
  "label": "姓名",
  "required": true,
  "show": {
    "$dispatch": "CONDITION",
    "left": "$model.enabled",
    "op": "eq",
    "right": true
  }
}`,
  },
};

type Mode = keyof typeof demos;
const modes = Object.keys(demos) as Mode[];
const activeMode = ref<Mode>("local");
const activeDemo = computed(() => demos[activeMode.value]);
const tabButtons: HTMLButtonElement[] = [];

async function onTabKeydown(event: KeyboardEvent, index: number) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  let next = index;
  if (event.key === "ArrowLeft") next = (index - 1 + modes.length) % modes.length;
  if (event.key === "ArrowRight") next = (index + 1) % modes.length;
  if (event.key === "Home") next = 0;
  if (event.key === "End") next = modes.length - 1;
  activeMode.value = modes[next];
  await nextTick();
  tabButtons[next]?.focus();
}
</script>

<template>
  <section class="home-explore" aria-labelledby="home-explore-title">
    <ol class="compact-flow" aria-label="Form 运行流程">
      <li>Schema</li>
      <li>Model</li>
      <li>Update</li>
      <li>Render</li>
    </ol>

    <div class="explore-heading">
      <h2 id="home-explore-title">一份 Schema，驱动整个表单。</h2>
      <p>字段、联动、校验和提交都在同一个运行时。选择一种方式开始。</p>
    </div>

    <div class="demo-shell">
      <div class="demo-topbar">
        <div class="demo-tabs" role="tablist" aria-label="Schema 类型">
          <button
            v-for="(demo, mode) in demos"
            :key="mode"
            :ref="(element) => { if (element) tabButtons[modes.indexOf(mode)] = element as HTMLButtonElement }"
            :id="`tab-${mode}`"
            type="button"
            role="tab"
            :aria-selected="activeMode === mode"
            :aria-controls="`panel-${mode}`"
            :tabindex="activeMode === mode ? 0 : -1"
            @click="activeMode = mode"
            @keydown="onTabKeydown($event, modes.indexOf(mode))"
          >
            {{ demo.label }}
          </button>
        </div>
        <span class="demo-file">{{ activeDemo.file }}</span>
      </div>

      <Transition name="demo" mode="out-in">
        <div
          :key="activeMode"
          :id="`panel-${activeMode}`"
          class="demo-content"
          role="tabpanel"
          :aria-labelledby="`tab-${activeMode}`"
        >
          <div class="demo-copy">
            <h3>{{ activeDemo.title }}</h3>
            <p>{{ activeDemo.description }}</p>
            <a :href="withBase(activeDemo.link)">{{ activeDemo.linkText }}<span aria-hidden="true"> →</span></a>
          </div>
          <pre class="demo-code"><code>{{ activeDemo.code }}</code></pre>
        </div>
      </Transition>
    </div>
  </section>
</template>
