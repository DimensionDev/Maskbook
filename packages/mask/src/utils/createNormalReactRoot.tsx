import { StrictMode, createContext } from 'react'
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
function Root(jsx: JSX.Element) {
    return (
        <StrictMode>
            <DisableShadowRootContext.Provider value>{jsx}</DisableShadowRootContext.Provider>
        </StrictMode>
    )
}
export function createNormalReactRoot(jsx: JSX.Element, dom?: HTMLElement) {
    cleanup()
    const container = getContainer(dom)
    return createRoot(container).render(Root(jsx))
}

// Note: we should not really do this. the normal way is to call hydrateRoot.
// but we have too many useSyncExternalStore calls that does not provides onHydrate (3rd argument)
// therefore hydrate actually works worse than render.
export function hydrateNormalReactRoot(jsx: JSX.Element, dom?: HTMLElement) {
    cleanup()
    const container = getContainer(dom)
    container.style.display = 'none'
    let called = false
    function replace() {
        if (called) return
        called = true
        const old = document.getElementById('root-ssr')
        if (old) old.style.display = 'none'
        container.style.display = 'initial'
    }
    setTimeout(replace, 250)
    return createRoot(container).render(
        <HydrateFinished.Provider value={replace}>{Root(jsx)}</HydrateFinished.Provider>,
    )
}
export const HydrateFinished = createContext(() => {})
