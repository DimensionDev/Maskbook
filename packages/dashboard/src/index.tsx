// This entry is for Snowpack to develop dashboard as an isolated website.

/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />

import './initialization/esbuild_jsx_transform'
import './initialization/isolated_bridge'
import './initialization/i18n'
import ReactDOM from 'react-dom'
import Dashboard from './initialization/Dashboard'
import { Suspense } from 'react'

if (import.meta.hot) {
    import.meta.hot.accept()
} else if (
    location.host === 'compassionate-northcutt-326a3a.netlify.app' ||
    location.host.startsWith('localhost') ||
    location.host.startsWith('127.0.0.1')
) {
    document.getElementById('warning')?.remove()
}

ReactDOM.unstable_createRoot(document.getElementById('root')!).render(
    <Suspense fallback="">
        <Dashboard />
    </Suspense>,
)
