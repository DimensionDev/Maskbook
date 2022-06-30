import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { DisableShadowRootContext } from '@masknet/theme'

function cleanup() {
    if (process.env.NODE_ENV === 'development') {
        // Make the document cleaner
        setTimeout(() => [...document.querySelectorAll('script')].forEach((x) => x.remove()), 200)
    }
}
function getContainer(container?: HTMLElement) {
    if (!container) container = document.getElementById('root') ?? void 0
    if (!container) {
        container = document.createElement('div')
        document.body.appendChild(container)
    }
    return container
}
function Root(jsx: JSX.Element) {
    return (
        <StrictMode>
            <DisableShadowRootContext.Provider value>
                <ErrorBoundary>{jsx}</ErrorBoundary>
            </DisableShadowRootContext.Provider>
        </StrictMode>
    )
}
export function createNormalReactRoot(jsx: JSX.Element, dom?: HTMLElement) {
    cleanup()
    const container = getContainer(dom)
    return createRoot(container).render(Root(jsx))
}

export function hydrateNormalReactRoot(jsx: JSX.Element, dom?: HTMLElement) {
    cleanup()
    const container = getContainer(dom)
    return hydrateRoot(container, Root(jsx))
}
