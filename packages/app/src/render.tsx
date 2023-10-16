import './setup/storage.js'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PageUIProvider } from '@masknet/shared'
import { DisableShadowRootContext } from '@masknet/theme'
import { MainUI } from './MainUI.js'
import { useTheme } from './hooks/useTheme.js'
import { initWallet } from '@masknet/web3-providers'
import { createSharedContext } from './helpers/createSharedContext.js'

initWallet(createSharedContext())
const root = document.createElement('main')
document.body.appendChild(root)

createRoot(root).render(
    <StrictMode>
        <DisableShadowRootContext.Provider value>
            <App />
        </DisableShadowRootContext.Provider>
    </StrictMode>,
)

function App() {
    return PageUIProvider(useTheme, <MainUI />)
}
