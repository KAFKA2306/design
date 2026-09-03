import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/globals.css';

function App() {
  return (
    <main className="page-container">
      <h1>Registry consumer</h1>
      <p>Installed from KAFKA2306/design/kafka-base.</p>
      <button type="button">Focus target</button>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
