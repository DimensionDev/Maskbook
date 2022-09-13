// This entry is for developing dashboard as an isolated website.

import './initialization/isolated_bridge.js'
import './initialization/i18n.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './initialization/Dashboard.js'

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept()
} else if (location.host === 'compassionate-northcutt-326a3a.netlify.app') {
    document.getElementById('warning')?.remove()
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Dashboard />
    </StrictMode>,
)
