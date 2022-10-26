import { ALL_EVENTS, ObservableMap } from '@masknet/shared-base'
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

/**
 * This container is used to attach the single React root.
 * It does not contain direct DOM decedents.
 * All decedents are mounted via <Portal>.
 */
let globalContainer: HTMLElement
/**
 * This container is prepared for all the Modals.
 */
let portalContainer: ShadowRoot
/** @internal */
export const shadowEnvironmentMountingRoots = new ObservableMap<any, JSX.Element>()

export function setupReactShadowRootEnvironment(init: ShadowRootInit) {
    if (portalContainer) return portalContainer
    // TODO: make sure globalContainer is the last DOM in the body?
    globalContainer = document.body.appendChild(document.createElement('div'))
    portalContainer = globalContainer.attachShadow(init)

    // Note: This React Root does not expect to have any direct DOM children.
    createRoot(globalContainer).render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
    return portalContainer
}
function App() {
    const [children, setChildren] = useState<JSX.Element[]>([])
    useEffect(() => {
        shadowEnvironmentMountingRoots.event.on(ALL_EVENTS, () => {
            setChildren(Array.from(shadowEnvironmentMountingRoots.values()))
        })
    }, [])
    // Note: This is safe because Map is ordered when iterating
    return <>{children}</>
}

/** @internal */
export const ref = {
    get portalContainer(): Element | ShadowRoot {
        let dom: Element | ShadowRoot
        if (location.protocol.includes('extension')) dom = document.body
        else if (globalThis.location.hostname === 'localhost') return document.body
        else if (!portalContainer) throw new TypeError('Please call setupPortalShadowRoot first')
        else dom = portalContainer

        Object.defineProperty(ref, 'mountingPoint', { value: dom })
        return dom
    },
}
