import './styles/index.css'
import './locales/init.js'
import './setup/storage.js'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PageUIProvider } from '@masknet/shared'
import { DisableShadowRootContext, MaskLightTheme } from '@masknet/theme'
import { useMountReport } from '@masknet/web3-hooks-base'
import { EventID } from '@masknet/web3-telemetry/types'
import { MainUI } from './MainUI.js'

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
    useMountReport(EventID.AccessPopups)

    return PageUIProvider(useTheme, <MainUI />)
}
function useTheme() {
    return MaskLightTheme
}
