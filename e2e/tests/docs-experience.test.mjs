import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../../", import.meta.url);

function read(path) {
  return readFileSync(new URL(path, root), "utf8");
}

test("uses a custom VitePress theme and a homepage runtime showcase", () => {
  for (const path of [
    "packages/docs/.vitepress/theme/index.ts",
    "packages/docs/.vitepress/theme/custom.css",
    "packages/docs/.vitepress/theme/HomeShowcase.vue",
  ]) {
    assert.ok(existsSync(new URL(path, root)), `${path} must exist`);
  }

  const theme = read("packages/docs/.vitepress/theme/index.ts");
  assert.match(theme, /DefaultTheme/);
  assert.match(theme, /Layout:/);
  assert.match(theme, /HomeShowcase/);
  assert.match(theme, /home-features-after/);
});

test("enables useful documentation discovery and contribution features", () => {
  const config = read("packages/docs/.vitepress/config.mts");
  assert.match(config, /lastUpdated:\s*true/);
  assert.match(config, /provider:\s*["']local["']/);
  assert.match(config, /editLink:/);
  assert.match(config, /nuvzek\/form\/edit\/main\/packages\/docs\/:path/);
});

test("keeps the homepage hero asset optimized", () => {
  const homepage = read("packages/docs/index.md");
  assert.match(homepage, /src:\s*\/oasis\.webp/);
  assert.ok(existsSync(new URL("packages/docs/public/oasis.webp", root)));
});

test("uses one focused code demo instead of six competing feature cards", () => {
  const homepage = read("packages/docs/index.md");
  const showcase = read("packages/docs/.vitepress/theme/HomeShowcase.vue");

  assert.doesNotMatch(homepage, /^features:/m);
  assert.doesNotMatch(homepage, /text: GitHub/);
  assert.match(showcase, /role="tablist"/);
  assert.match(showcase, /aria-selected/);
  assert.match(showcase, /role="tabpanel"/);
});
