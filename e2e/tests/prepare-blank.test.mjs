import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const script = new URL("../prepare-blank.mjs", import.meta.url);

test("prepare-blank copies a clean fixture and refuses to overwrite it", () => {
  assert.ok(existsSync(script), "prepare-blank.mjs must exist");
  const parent = mkdtempSync(join(tmpdir(), "nuvzek-form-e2e-test-"));
  const target = join(parent, "blank");

  try {
    const first = spawnSync(process.execPath, [script.pathname, target], {
      encoding: "utf8",
    });
    assert.equal(first.status, 0, first.stderr);
    assert.ok(existsSync(join(target, "src", "App.vue")));
    assert.ok(existsSync(join(target, "package.json")));
    assert.ok(!existsSync(join(target, "node_modules")));
    assert.ok(!existsSync(join(target, "dist")));

    const manifest = JSON.parse(readFileSync(join(target, "package.json"), "utf8"));
    assert.equal(manifest.name, "@nuvzek/form-blank");

    mkdirSync(join(target, "node_modules"));
    writeFileSync(join(target, "node_modules", "marker"), "keep");
    const second = spawnSync(process.execPath, [script.pathname, target], {
      encoding: "utf8",
    });
    assert.equal(second.status, 1);
    assert.ok(second.stderr.includes("非空"));
    assert.equal(readFileSync(join(target, "node_modules", "marker"), "utf8"), "keep");
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
