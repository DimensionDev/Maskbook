import { createPortal } from 'react-dom'
import {
    attachReactTreeToMountedRoot_noHost,
    setupReactShadowRootEnvironment as setupReactShadowRootEnvironmentUpper,
    CSSVariableInjector,
    usePortalShadowRoot,
} from '@masknet/theme'
import { Flags } from '@masknet/flags'
import { ContentScriptGlobalProvider } from './ContentScriptGlobalProvider.js'
import { ShadowRootAttachPointRoot } from './ShadowRootAttachPointRoot.js'

const captureEvents: Array<keyof HTMLElementEventMap> = [
    'paste',
    'keydown',
    'keypress',
    'keyup',
    'drag',
    'dragend',
    'dragenter',
    'dragleave',
    'dragover',
    'dragstart',
    'change',
]
export function setupReactShadowRootEnvironment() {
    const shadow = setupReactShadowRootEnvironmentUpper(
        Flags.shadowRootInit,
        captureEvents,
        ContentScriptGlobalProvider,
    )
    // Inject variable for Portals
    attachReactTreeWithContainer(shadow, { key: 'css-vars' }).render(<CSSVariableInjector />)
}

export const attachReactTreeWithContainer = attachReactTreeToMountedRoot_noHost(ShadowRootAttachPointRoot)

function AttachReactTreeWithoutContainerRedirect(props: React.PropsWithChildren<{ debugKey: string }>) {
    // Note: since it is the direct children of attachReactTreeWithoutContainer, it MUST inside a ShadowRoot environment.
    return usePortalShadowRoot((container) => createPortal(props.children, container!), props.debugKey)
}
/**
 * @param debugKey Only used for debug
 * @param jsx JSX to render
 * @param signal AbortSignal
 */
export function attachReactTreeWithoutContainer(debugKey: string, jsx: React.ReactNode, signal?: AbortSignal) {
    // Note: do not attach this DOM to window. We don't need it
    const dom = document.createElement('main')
    const shadow = dom.attachShadow({ mode: 'closed', delegatesFocus: true })

    attachReactTreeWithContainer(shadow, { signal, key: debugKey }).render(
        <AttachReactTreeWithoutContainerRedirect children={jsx} debugKey={debugKey} />,
    )
}
