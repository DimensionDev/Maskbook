import './i18n.js'
import { StrictMode, lazy } from 'react'
import { createNormalReactRoot } from '../../shared-ui/utils/createNormalReactRoot.js'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient } from '@masknet/shared-base-ui'
import { queryPersistOptions } from '../../shared-ui/utils/persistOptions.js'

const Dashboard = lazy(() => import(/* webpackMode: 'eager' */ '../Dashboard.js'))
createNormalReactRoot(
    <StrictMode>
        <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions}>
            <Dashboard />
        </PersistQueryClientProvider>
    </StrictMode>,
)
