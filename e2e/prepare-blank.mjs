#!/usr/bin/env node

import { cpSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function prepareBlank(target) {
  if (!target) {
    throw new Error("用法：node e2e/prepare-blank.mjs <empty-target-directory>");
  }
  const destination = resolve(target);
  if (existsSync(destination) && readdirSync(destination).length > 0) {
    throw new Error(`目标目录必须为空，拒绝覆盖非空目录：${destination}`);
  }
  const source = fileURLToPath(new URL("../packages/blank", import.meta.url));
  cpSync(source, destination, {
    recursive: true,
    filter: (path) => {
      const relative = path.slice(source.length).replaceAll("\\", "/");
      return !/(^|\/)(node_modules|dist)(\/|$)/.test(relative);
    },
  });
  return destination;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  try {
    const destination = prepareBlank(process.argv[2]);
    console.log(`Blank Vue project prepared at ${destination}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
