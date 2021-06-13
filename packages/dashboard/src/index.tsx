// This entry is for Snowpack to develop dashboard as an isolated website.

import type {} from 'react/next'
import type {} from 'react-dom/next'

import './initialization/esbuild_jsx_transform'
import './initialization/isolated_bridge'
import './initialization/i18n'
import ReactDOM from 'react-dom'
import Dashboard from './initialization/Dashboard'

if (import.meta.hot) {
    import.meta.hot.accept()
} else if (location.host === 'compassionate-northcutt-326a3a.netlify.app') {
    document.getElementById('warning')?.remove()
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Dashboard />)
