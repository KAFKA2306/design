import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function App() {
  return <main className="min-h-screen bg-background text-foreground p-4"><h1 className="text-lg font-semibold">Registry consumer</h1><p className="text-sm text-muted-foreground">Canonical tokens are installed by kafka-base.</p></main>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
