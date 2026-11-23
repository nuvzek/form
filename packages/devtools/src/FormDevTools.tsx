import { computed, defineComponent, PropType, ref } from "vue";
import type { FormDebugEvent, FormRuntime } from "@nuvzek/form";
import { formatDebugValue } from "./format";
import "./style.css";

const tabs = [
  { id: "model", label: "Model" },
  { id: "schema", label: "Schema" },
  { id: "dependencies", label: "Dependencies" },
  { id: "dispatches", label: "Dispatches" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default defineComponent({
  name: "FormDevTools",
  props: {
    runtime: {
      type: Object as PropType<FormRuntime>,
      required: true,
    },
  },
  setup(props) {
    const collapsed = ref(false);
    const activeTab = ref<TabId>("model");
    const copied = ref(false);

    const model = computed(() => formatDebugValue(props.runtime._model.model.value));
    const shared = computed(() => formatDebugValue(props.runtime.shared));
    const schema = computed(() => formatDebugValue(props.runtime._schema.parsedSchemas.value));
    const dependencies = computed(() =>
      Array.from(props.runtime._update.effects.entries()).flatMap(([effectKey, effects]: [string, Map<string, any>]) =>
        Array.from(effects.values()).map((effect) => ({
          effectKey,
          type: effect.trackingType,
          path: effect.trackingPath,
        })),
      ),
    );
    const events = computed(() => props.runtime.debugEvents.value);

    async function copyModel() {
      await navigator.clipboard.writeText(model.value);
      copied.value = true;
      setTimeout(() => (copied.value = false), 1200);
    }

    function eventText(event: FormDebugEvent) {
      return event.detail ? formatDebugValue(event.detail) : event.path;
    }

    return () => {
      if (collapsed.value) {
        return (
          <button class="fdt-launcher" type="button" onClick={() => (collapsed.value = false)}>
            Form DevTools
          </button>
        );
      }

      return (
        <section class="form-devtools" aria-label="Form DevTools">
          <header class="fdt-header">
            <div class="fdt-title">
              <strong>Form DevTools</strong>
              <span>DEV</span>
            </div>
            <div class="fdt-actions">
              <button type="button" onClick={copyModel}>{copied.value ? "已复制" : "复制 Model"}</button>
              <button type="button" aria-label="收起 DevTools" onClick={() => (collapsed.value = true)}>收起</button>
            </div>
          </header>

          <nav class="fdt-tabs" aria-label="调试内容">
            {tabs.map((tab) => (
              <button
                type="button"
                class={activeTab.value === tab.id ? "active" : ""}
                aria-pressed={activeTab.value === tab.id}
                onClick={() => (activeTab.value = tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <main class="fdt-content">
            {activeTab.value === "model" && (
              <div class="fdt-section">
                <h3>Model</h3>
                <pre>{model.value}</pre>
                <h3>Shared</h3>
                <pre>{shared.value}</pre>
              </div>
            )}

            {activeTab.value === "schema" && (
              <div class="fdt-section">
                <h3>Parsed schemas</h3>
                <pre>{schema.value}</pre>
              </div>
            )}

            {activeTab.value === "dependencies" && (
              <div class="fdt-section">
                {dependencies.value.length === 0 ? (
                  <p class="fdt-empty">当前没有已注册的依赖。</p>
                ) : (
                  <ul class="fdt-list">
                    {dependencies.value.map((dependency) => (
                      <li>
                        <span class="fdt-kind">{dependency.type}</span>
                        <code>{dependency.path}</code>
                        <small>{dependency.effectKey}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab.value === "dispatches" && (
              <div class="fdt-section">
                <div class="fdt-section-actions">
                  <span>{events.value.length} 条记录</span>
                  <button type="button" onClick={() => (props.runtime.debugEvents.value = [])}>清空日志</button>
                </div>
                {events.value.length === 0 ? (
                  <p class="fdt-empty">还没有调试事件。修改字段或发起请求后，这里会显示记录。</p>
                ) : (
                  <ul class="fdt-list fdt-events">
                    {events.value.map((event) => (
                      <li data-status={event.status}>
                        <div class="fdt-event-meta">
                          <span class="fdt-kind">{event.kind}</span>
                          <span class="fdt-status">{event.status}</span>
                        </div>
                        <code>{event.path}</code>
                        {event.detail && <pre>{eventText(event)}</pre>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </main>
        </section>
      );
    };
  },
});
