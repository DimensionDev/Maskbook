import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '../components/shared/ErrorBoundary'
import { DisableShadowRootContext } from '@masknet/theme'

export function createNormalReactRoot(jsx: JSX.Element, container?: HTMLElement) {
    if (!container) container = document.getElementById('root') ?? void 0
    if (!container) {
        container = document.createElement('div')
        document.body.appendChild(container)
    }

    if (process.env.NODE_ENV === 'development') {
        // Make the document cleaner
        setTimeout(() => [...document.querySelectorAll('script')].forEach((x) => x.remove()), 200)
    }

    return createRoot(container).render(
        <StrictMode>
            <DisableShadowRootContext.Provider value>
                <ErrorBoundary>{jsx}</ErrorBoundary>
            </DisableShadowRootContext.Provider>
        </StrictMode>,
    )
}
