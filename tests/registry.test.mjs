import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8'));
const base = registry.items.find((item) => item.name === 'kafka-base');

test('kafka-base is the single v0 design-system base', () => {
  assert.ok(base);
  assert.equal(base.type, 'registry:base');
  assert.equal(base.extends, 'none');
  assert.equal(registry.items.filter((item) => item.type === 'registry:base').length, 1);
});

test('new consumers are pinned to Base UI implementation baseline and Lucide', () => {
  assert.equal(base.config.style, 'base-nova');
  assert.match(base.config.style, /^base-/);
  assert.equal(base.config.iconLibrary, 'lucide');
  assert.equal(base.config.rsc, false);
  assert.equal(base.config.tsx, true);
});

test('registry distributes generated web styles but not DTCG source authority', () => {
  const paths = base.files.map((file) => file.path);
  assert.deepEqual(paths, ['styles/tokens.css', 'styles/globals.css', 'styles/components.css']);
  assert.equal(paths.some((path) => path.startsWith('tokens/')), false);
  assert.equal(base.files[0].target, '~/src/styles/kafka-tokens.css');
  assert.equal(base.files[1].target, '~/src/styles/kafka-globals.css');
  assert.equal(base.files[2].target, '~/src/styles/kafka-components.css');
});

test('shadcn semantic vars alias canonical tokens instead of duplicating colors', () => {
  for (const theme of ['light', 'dark']) {
    const values = Object.values(base.cssVars[theme]);
    assert.ok(values.length > 0);
    for (const value of values) {
      assert.match(value, /^var\(--k-color-[a-z-]+\)$/);
      assert.doesNotMatch(value, /#|oklch|hsl|rgb/i);
    }
  }
  assert.equal(base.cssVars.light.background, 'var(--k-color-canvas)');
  assert.equal(base.cssVars.light.primary, 'var(--k-color-primary)');
  assert.equal(base.cssVars.light['chart-2'], 'var(--k-color-accent)');
  assert.equal(base.cssVars.light.sidebar, 'var(--k-color-surface)');
});

test('registry imports generated foundation and component styles into consumer CSS entry', () => {
  assert.deepEqual(base.css, {
    '@import "./styles/kafka-tokens.css"': {},
    '@import "./styles/kafka-globals.css"': {},
    '@import "./styles/kafka-components.css"': {},
  });
});

test('external visual dependency versions are explicit', () => {
  assert.deepEqual(base.dependencies, ['lucide-react@1.39.0']);
});
