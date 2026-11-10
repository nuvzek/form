import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../../", import.meta.url);
const skillRoot = new URL("skills/nuvzek-form/", root);
const requiredFiles = [
  "SKILL.md",
  "references/local-schema.md",
  "references/ssr-schema.md",
  "references/dispatch.md",
  "references/runtime-api.md",
  "references/adapter-discovery.md",
  "references/i18n.md",
  "references/review-checklist.md",
  "assets/local-basic.tsx",
  "assets/local-dependent.tsx",
  "assets/local-i18n.tsx",
  "assets/ssr-basic.json",
  "assets/ssr-linked.json",
  "assets/ssr-i18n.json",
  "scripts/validate-ssr-schema.mjs",
];

test("ships the complete directory-form skill", () => {
  for (const file of requiredFiles) {
    assert.ok(existsSync(new URL(file, skillRoot)), `${file} must exist`);
  }
});

test("uses portable Agent Skills metadata and relative resources", () => {
  const path = new URL("SKILL.md", skillRoot);
  assert.ok(existsSync(path), "SKILL.md must exist");
  const content = readFileSync(path, "utf8");
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);

  assert.ok(frontmatter, "SKILL.md must start with YAML frontmatter");
  assert.match(frontmatter[1], /^name: nuvzek-form$/m);
  assert.match(frontmatter[1], /^description: .+/m);
  assert.doesNotMatch(frontmatter[1], /^(type|whenToUse|arguments):/m);
  assert.doesNotMatch(content, /\$\{KIMI_SKILL_DIR\}|\$ARGUMENTS/);
  assert.doesNotMatch(content, /\/Users\//);
  assert.ok(content.split("\n").length < 500);
});

test("keeps the blank fixture free of Form and UI dependencies", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("packages/blank/package.json", root), "utf8"),
  );
  const dependencies = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
  };

  for (const dependency of Object.keys(dependencies)) {
    assert.ok(
      !["@nuvzek/form", "@arco-design/web-vue", "naive-ui", "element-plus"].includes(dependency),
      `blank fixture must not preinstall ${dependency}`,
    );
  }
});

test("provides a Kimi plugin wrapper without moving the portable skill", () => {
  const manifestPath = new URL("kimi.plugin.json", root);
  assert.ok(existsSync(manifestPath), "kimi.plugin.json must exist");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.name, "nuvzek-form");
  assert.equal(manifest.skills, "./skills/");
});
