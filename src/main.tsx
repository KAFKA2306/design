import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DecisionPanel } from '../registry/ui/product/decision';
import '../styles/tokens.css';
import '../styles/globals.css';
import '../styles/components.css';
import './specimen.css';

declare const __DESIGN_COMMIT_SHA__: string;

type Theme = 'light' | 'dark';

const palette = [
  ['Canvas', 'canvas'], ['Surface', 'surface'], ['Foreground', 'foreground'], ['Primary', 'primary'],
  ['Accent', 'accent'], ['Success', 'success'], ['Warning', 'warning'], ['Danger', 'danger'],
] as const;

const deployedCommitUrl = `https://github.com/KAFKA2306/design/commit/${__DESIGN_COMMIT_SHA__}`;

function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const applyTheme = (next: Theme) => {
    document.documentElement.dataset.theme = next === 'dark' ? 'dark' : '';
    setTheme(next);
  };

  return (
    <main className="page-container specimen">
      <header className="specimen-header">
        <div>
          <p className="eyebrow">KAFKA2306 / DESIGN</p>
          <h1>Decision-first UI authority.</h1>
          <p className="lede">Tokens, components, product surfaces, journey grammar, and conformance checks live in one canonical repository. This page is built from that same authority.</p>
          <p><a href="https://github.com/KAFKA2306/design">View source on GitHub</a> · <a href={deployedCommitUrl}>Deployed commit {__DESIGN_COMMIT_SHA__.slice(0, 7)}</a></p>
        </div>
        <button className="theme-toggle" type="button" aria-pressed={theme === 'dark'} onClick={() => applyTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </header>

      <DecisionPanel
        eyebrow="CANONICAL PRODUCT UI"
        title="A reusable surface should end in a decision"
        decision="Adopt the authority, not a screenshot"
        rationale="Consumers sync pinned canonical source and verify conformance instead of copying visual rules."
        state="ready"
        primaryAction={{ label: 'Inspect registry', onClick: () => { window.location.href = `https://github.com/KAFKA2306/design/tree/${__DESIGN_COMMIT_SHA__}/registry/ui`; } }}
        secondaryAction={{ label: 'Read adoption contract', onClick: () => { window.location.href = `https://github.com/KAFKA2306/design/blob/${__DESIGN_COMMIT_SHA__}/README.md#consumer-adoption`; } }}
        evidence={[
          { label: 'Source', detail: 'registry/ui/product/decision.tsx' },
          { label: 'Verification', detail: 'Contract tests + deterministic consumer conformance' },
          { label: 'Data', detail: 'This showcase makes no production performance claim' },
        ]}
      />

      <section aria-labelledby="system-title">
        <div className="section-heading"><h2 id="system-title">One system, reusable layers</h2><span>canonical source</span></div>
        <div className="color-grid">
          <div className="color-item"><div><strong>Foundation</strong><code>tokens/ + styles/</code></div></div>
          <div className="color-item"><div><strong>Product UI</strong><code>registry/ui/product/</code></div></div>
          <div className="color-item"><div><strong>Journey</strong><code>journey.ts</code></div></div>
          <div className="color-item"><div><strong>Adoption</strong><code>design-sync + conformance</code></div></div>
        </div>
      </section>

      <section aria-labelledby="color-title">
        <div className="section-heading"><h2 id="color-title">Token authority</h2><span>light + automatic dark mode</span></div>
        <div className="color-grid">
          {palette.map(([label, token]) => (
            <div className="color-item" key={token}><div className={`swatch swatch-${token}`} aria-hidden="true" /><div><strong>{label}</strong><code>--k-color-{token}</code></div></div>
          ))}
        </div>
      </section>

      <section aria-labelledby="contract-title">
        <div className="section-heading"><h2 id="contract-title">What consumers get</h2><span>fail loudly</span></div>
        <div className="state-list">
          <p className="state state-success"><strong>Deterministic sync</strong> — pin an exact design commit and install managed source.</p>
          <p className="state state-success"><strong>Conformance</strong> — duplicated visual authority and drift fail with a rule and path.</p>
          <p className="state state-warning"><strong>Evidence semantics</strong> — actual, forecast, hypothesis, and unverified stay distinguishable.</p>
          <p className="state state-danger"><strong>No silent fallback</strong> — missing canonical input or required state remains visible.</p>
        </div>
      </section>

      <section aria-labelledby="adopt-title">
        <div className="section-heading"><h2 id="adopt-title">Adopt</h2><span>two commands after config</span></div>
        <div className="type-stack">
          <p className="type-mono">pnpm sync --consumer &lt;consumer-path&gt;</p>
          <p className="type-mono">pnpm conformance --consumer &lt;consumer-path&gt;</p>
          <p className="type-small">The repository remains the authority; consumer business logic and raw telemetry remain in the consumer.</p>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
