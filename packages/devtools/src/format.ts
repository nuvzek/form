export function formatDebugValue(value: unknown): string {
  const seen = new WeakSet<object>();

  try {
    return JSON.stringify(
      value,
      (_key, current) => {
        if (typeof current === "function") {
          return `[Function ${current.name || "anonymous"}]`;
        }
        if (typeof current === "bigint" || typeof current === "symbol") {
          return String(current);
        }
        if (current instanceof Error) {
          return {
            name: current.name,
            message: current.message,
            stack: current.stack,
          };
        }
        if (current instanceof Map) {
          return Object.fromEntries(current);
        }
        if (current instanceof Set) {
          return Array.from(current);
        }
        if (typeof current === "object" && current !== null) {
          if (seen.has(current)) return "[Circular]";
          seen.add(current);
        }
        return current;
      },
      2,
    ) ?? "undefined";
  } catch (error) {
    return `Unable to serialize value: ${error instanceof Error ? error.message : String(error)}`;
  }
}
