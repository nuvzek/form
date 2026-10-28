import { TriggerType } from "@/core/lifecycle/Update/types";
import Runtime from "@/core/runtime";
import { watchEffect } from "vue";

export default class Update {
  effects = new Map();
  constructor(public runtime: Runtime) {}

  track(key: string, effect: any) {
    // 为可能存在的 share 也保存一份 track，从而隔离开来，避免无限触发
    let effectMap = this.effects.get(key);
    if (!effectMap) {
      effectMap = new Map();
    }
    if (!effectMap.has(effect.trackingPath)) {
      effectMap.set(effect.trackingPath, effect);
    }
    this.effects.set(key, effectMap);
  }

  // 目前的更新逻辑是当 model 变化或者 share 执行时，触发 schema 的重新计算
  // TODO 优化数据结构，提升更新效能
  trigger(type: TriggerType = "model", path?: string) {
    for (const effect of this.effects.values()) {
      for (const effectItem of effect.values()) {
        // 同一个 effectKey 下可能同时存在 model/share/locale 多种类型的 track（比如一个函数
        // 既用了 utils.model 又用了 utils.locale），所以这里要用 continue 跳过不匹配的类型，
        // 而不是 break 掉整个 map 的后续遍历
        if (effectItem.trackingType !== type) continue;
        if (!effectItem.trackingPath.includes(path)) continue;

        effectItem.trackedEffect(type);
      }
    }
  }

  reset() {
    this.effects.clear();
  }
}
