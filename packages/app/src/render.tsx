import './setup/storage.js'
import './setup/wallet.js'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PageUIProvider } from '@masknet/shared'
import { queryClient } from '@masknet/shared-base-ui'
import { DisableShadowRootContext } from '@masknet/theme'
import { MainUI } from './MainUI.js'
import { useTheme } from './hooks/useTheme.js'
import { PersistQueryClientProvider, type PersistQueryClientOptions } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

function App() {
    return PageUIProvider(useTheme, <MainUI />)
}
const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
    persister: createSyncStoragePersister({
        storage: localStorage,
    }),
    buster: 'v1',
    dehydrateOptions: {
        shouldDehydrateQuery: ({ queryKey }) => {
            if (Array.isArray(queryKey) && String(queryKey[0]).startsWith('@@')) return true
            return false
        },
    },
}
broadcastQueryClient({ queryClient })

export default function renderApp() {
    const root = document.createElement('main')
    document.body.appendChild(root)

    createRoot(root).render(
        <StrictMode>
            <DisableShadowRootContext.Provider value>
                <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
                    <App />
                </PersistQueryClientProvider>
            </DisableShadowRootContext.Provider>
        </StrictMode>,
    )
}
