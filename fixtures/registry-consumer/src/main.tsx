import React from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from './components/ui/button'
import { Dialog } from './components/ui/dialog'
import { Input } from './components/ui/input'
import { Tabs } from './components/ui/tabs'
import './index.css'

const tabs = [
  { value: 'overview', label: 'Overview', content: <p>Portfolio overview is selected.</p> },
  { value: 'risk', label: 'Risk', content: <p>Risk assumptions are visible here.</p> },
  { value: 'disabled', label: 'Disabled', content: <p>Disabled tab.</p>, disabled: true },
] as const

function App() {
  return (
    <main className="page-container consumer-specimen">
      <h1>Core UI consumer specimen</h1>

      <section aria-labelledby="button-heading">
        <h2 id="button-heading">Button</h2>
        <div className="consumer-row">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button loading loadingLabel="Saving">Save</Button>
        </div>
      </section>

      <section aria-labelledby="input-heading">
        <h2 id="input-heading">Input</h2>
        <div className="consumer-stack">
          <Input label="Portfolio name" placeholder="Growth portfolio" />
          <Input label="Disabled field" disabled value="Read only" readOnly />
          <Input label="Risk limit" defaultValue="150" error="Enter a value from 0 to 100." />
        </div>
      </section>

      <section aria-labelledby="dialog-heading">
        <h2 id="dialog-heading">Dialog</h2>
        <Dialog
          trigger="Review assumptions"
          title="Review assumptions"
          description="Escape closes the dialog and focus returns to the trigger."
        >
          <p>Keyboard and focus management are delegated to Base UI Dialog.</p>
        </Dialog>
      </section>

      <section aria-labelledby="tabs-heading">
        <h2 id="tabs-heading">Tabs</h2>
        <Tabs defaultValue="overview" items={tabs} />
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
