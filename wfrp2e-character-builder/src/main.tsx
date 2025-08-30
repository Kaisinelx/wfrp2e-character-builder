import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CharacterDraftProvider } from './state/CharacterDraftContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CharacterDraftProvider>
      <App />
    </CharacterDraftProvider>
  </StrictMode>,
)