import { StrictMode, type JSX } from 'react'
import { createRoot } from 'react-dom/client'
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
export function createNormalReactRoot(jsx: JSX.Element, dom?: HTMLElement) {
    cleanup()
    const container = getContainer(dom)
    return createRoot(container).render(
        <StrictMode>
            <DisableShadowRootContext value>{jsx}</DisableShadowRootContext>
        </StrictMode>,
    )
}
