import './setup/storage.js'

import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PageUIProvider } from '@masknet/shared'
import { DisableShadowRootContext, MaskDarkTheme, MaskLightTheme } from '@masknet/theme'
import { useMountReport } from '@masknet/web3-hooks-base'
import { EventID } from '@masknet/web3-telemetry/types'
import { MainUI } from './MainUI.js'
import { useThemeMode } from './helpers/setThemeMode.js'
import { MaskMessages } from '@masknet/shared-base'
import { type Appearance } from '@masknet/public-api'

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
    const themeMode = useThemeMode()
    const [mode, setMode] = useState<Appearance>(themeMode)

    useEffect(() => MaskMessages.events.appearanceSettings.on((data) => setMode(data)), [])

    if (mode === 'dark') return MaskDarkTheme
    return MaskLightTheme
}
