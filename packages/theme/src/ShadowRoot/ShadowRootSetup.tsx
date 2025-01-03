import { ObservableMap } from '@masknet/shared-base'
import { StrictMode, useSyncExternalStore, type JSX } from 'react'
import { createRoot } from 'react-dom/client'
import { PreventShadowRootEventPropagationListContext } from './Contexts.js'

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
export type WrapJSX = ((jsx: React.ReactNode) => React.ReactNode) | undefined
/** @internal */
export const shadowEnvironmentMountingRoots = new ObservableMap<any, JSX.Element>()

export function setupReactShadowRootEnvironment(
    init: ShadowRootInit,
    preventEventPropagationList: Array<keyof HTMLElementEventMap>,
    wrapJSX?: WrapJSX,
) {
    if (portalContainer) return portalContainer
    // TODO: make sure globalContainer is the last DOM in the body?
    globalContainer = document.body.appendChild(document.createElement('div'))
    portalContainer = globalContainer.attachShadow(init)

    // Note: This React Root does not expect to have any direct DOM children.
    createRoot(globalContainer).render(
        <StrictMode>
            <MountingPoint wrapJSX={wrapJSX} preventPropagationList={preventEventPropagationList} />
        </StrictMode>,
    )
    return portalContainer
}
const subscribe = (f: () => void) =>
    shadowEnvironmentMountingRoots.event.on(shadowEnvironmentMountingRoots.ALL_EVENTS, f)
function MountingPoint(props: { wrapJSX: WrapJSX; preventPropagationList: Array<keyof HTMLElementEventMap> }) {
    const children = useSyncExternalStore(subscribe, () => shadowEnvironmentMountingRoots.asValues)
    return (
        <PreventShadowRootEventPropagationListContext value={props.preventPropagationList}>
            {props.wrapJSX ? props.wrapJSX(children) : children}
        </PreventShadowRootEventPropagationListContext>
    )
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
