import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { Providers } from './providers.tsx'

const root = document.getElementById('root')
if (!root) throw new Error('#root not found')

createRoot(root).render(
    <StrictMode>
        <Providers>
            <App />
        </Providers>
    </StrictMode>,
)
