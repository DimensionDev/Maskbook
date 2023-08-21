import { createContext, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DisableShadowRootContext } from '@masknet/theme'
import { once } from 'lodash-es'

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
    const cursorLoadingHint = document.createElement('style')
    cursorLoadingHint.innerText = 'button, a { cursor: wait !important; }'
    document.head.appendChild(cursorLoadingHint)

    const container = getContainer(dom)
    container.style.display = 'none'
    let called = 0
    function hydrateFinished() {
        // in dev mode each component will be called twice therefore we only add 0.5
        called += process.env.NODE_ENV === 'development' ? 0.5 : 1
        // this is a magic number, the times we re-render before the real UI show up.
        if (called < 10) return
        replace()
    }
    const replace = once(() => {
        const old = document.getElementById('root-ssr')
        if (old) old.style.display = 'none'
        container.style.display = 'initial'
        cursorLoadingHint.remove()
    })
    setTimeout(replace, 1500)
    return createRoot(container).render(
        <HydrateFinished.Provider value={hydrateFinished}>{Root(jsx)}</HydrateFinished.Provider>,
    )
}
export const HydrateFinished = createContext(() => {})
