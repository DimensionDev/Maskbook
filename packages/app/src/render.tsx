import './setup/storage.js'
import './setup/wallet.js'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PageUIProvider } from '@masknet/shared'
import { DisableShadowRootContext } from '@masknet/theme'
import { MainUI } from './MainUI.js'
import { useTheme } from './hooks/useTheme.js'

function App() {
    return PageUIProvider(useTheme, <MainUI />)
}

export default function renderApp() {
    const root = document.createElement('main')
    document.body.appendChild(root)

    createRoot(root).render(
        <StrictMode>
            <DisableShadowRootContext.Provider value>
                <App />
            </DisableShadowRootContext.Provider>
        </StrictMode>,
    )
}
