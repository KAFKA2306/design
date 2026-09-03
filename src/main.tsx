import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/globals.css';
import './specimen.css';

type Theme = 'light' | 'dark';

const palette = [
  ['Canvas', 'canvas'],
  ['Surface', 'surface'],
  ['Foreground', 'foreground'],
  ['Primary', 'primary'],
  ['Accent', 'accent'],
  ['Success', 'success'],
  ['Warning', 'warning'],
  ['Danger', 'danger'],
] as const;

const spacing = ['space1', 'space2', 'space3', 'space4'] as const;

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
          <p className="eyebrow">KAFKA2306 / DESIGN FOUNDATION</p>
          <h1>Bloomberg密度のvisual foundation</h1>
          <p className="lede">色・文字・密度・境界・状態を、同じtoken authorityから確認する。</p>
        </div>
        <button
          className="theme-toggle"
          type="button"
          aria-pressed={theme === 'dark'}
          onClick={() => applyTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </header>

      <section aria-labelledby="color-title">
        <div className="section-heading">
          <h2 id="color-title">Color</h2>
          <span>functional palette</span>
        </div>
        <div className="color-grid">
          {palette.map(([label, token]) => (
            <div className="color-item" key={token}>
              <div className={`swatch swatch-${token}`} aria-hidden="true" />
              <div><strong>{label}</strong><code>--k-color-{token}</code></div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="type-title">
        <div className="section-heading"><h2 id="type-title">Typography</h2><span>compact hierarchy</span></div>
        <div className="type-stack">
          <p className="type-title">20px Title / Portfolio risk monitor</p>
          <p className="type-body">14px Body / 数値と判断材料を短い距離で比較する。</p>
          <p className="type-small">12px Small / Source: canonical fixture · 2026-09-03 JST</p>
          <p className="type-mono">MONO 1.284 / +3.42% / USDJPY</p>
        </div>
      </section>

      <section aria-labelledby="density-title">
        <div className="section-heading"><h2 id="density-title">Density</h2><span>30px data row</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Asset</th><th>Weight</th><th>Return</th><th>Risk</th></tr></thead>
            <tbody>
              <tr><td>NASDAQ 100</td><td>42.0%</td><td>+18.4%</td><td>21.2%</td></tr>
              <tr><td>Gold</td><td>18.0%</td><td>+9.8%</td><td>14.1%</td></tr>
              <tr><td>US Treasury</td><td>12.0%</td><td>+4.2%</td><td>6.8%</td></tr>
              <tr><td>USDJPY</td><td>8.0%</td><td>+6.1%</td><td>10.3%</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="two-column">
        <section aria-labelledby="spacing-title">
          <div className="section-heading"><h2 id="spacing-title">Spacing</h2><span>4 / 8 / 12 / 16</span></div>
          <div className="spacing-list">
            {spacing.map((token) => <div className={`spacing-row spacing-${token}`} key={token}><code>{token}</code><span /></div>)}
          </div>
        </section>

        <section aria-labelledby="state-title">
          <div className="section-heading"><h2 id="state-title">State</h2><span>color + text</span></div>
          <div className="state-list">
            <p className="state state-success"><strong>Success</strong> data loaded</p>
            <p className="state state-warning"><strong>Warning</strong> source is stale</p>
            <p className="state state-danger"><strong>Danger</strong> calculation failed</p>
          </div>
        </section>
      </div>

      <section aria-labelledby="focus-title">
        <div className="section-heading"><h2 id="focus-title">Focus</h2><span>keyboard visible</span></div>
        <div className="focus-row">
          <button className="primary-control" type="button">Primary action</button>
          <a href="#color-title">Jump to colors</a>
          <input aria-label="Specimen input" placeholder="Focus with Tab" />
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
