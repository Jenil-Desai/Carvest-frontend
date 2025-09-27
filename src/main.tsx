import { createRoot } from 'react-dom/client'
import '@rainbow-me/rainbowkit/styles.css';
import { StrictMode } from 'react'

import { Providers } from '@/providers/Providers.tsx';
import App from '@/App.tsx'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
