import {
    attachReactTreeToMountedRoot_noHost,
    setupReactShadowRootEnvironment as setupReactShadowRootEnvironmentUpper,
    CSSVariableInjector,
    usePortalShadowRoot,
} from '@masknet/theme'
import { createPortal } from 'react-dom'
import { MaskUIRoot } from '../../UIRoot.js'
import { useClassicMaskSNSTheme } from '../theme/index.js'

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
    const shadow = setupReactShadowRootEnvironmentUpper({ mode: process.env.shadowRootMode })
    attachReactTreeToGlobalContainer_inner(shadow, { key: 'css-vars' }).render(<CSSVariableInjector />)
}

// https://github.com/DimensionDev/Maskbook/issues/3265 with fast refresh or import order?
const attachReactTreeToGlobalContainer_inner = attachReactTreeToMountedRoot_noHost({
    preventEventPropagationList: captureEvents,
    wrapJSX(jsx) {
        return (
            <MaskUIRoot useTheme={useClassicMaskSNSTheme} kind="sns">
                <CSSVariableInjector />
                {jsx}
            </MaskUIRoot>
        )
    },
})

/** @deprecated Renamed to attachReactTreeToGlobalContainer */
export function createReactRootShadowed(...args: Parameters<typeof attachReactTreeToGlobalContainer_inner>) {
    // @ts-expect-error
    createReactRootShadowed = attachReactTreeToGlobalContainer_inner
    return attachReactTreeToGlobalContainer_inner(...args)
}

export function attachReactTreeToGlobalContainer(...args: Parameters<typeof attachReactTreeToGlobalContainer_inner>) {
    // @ts-expect-error
    attachReactTreeToGlobalContainer = attachReactTreeToGlobalContainer_inner
    return attachReactTreeToGlobalContainer_inner(...args)
}

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
    const shadow = dom.attachShadow({ mode: 'closed' })

    attachReactTreeToGlobalContainer_inner(shadow, { signal, key: debugKey }).render(
        <AttachReactTreeWithoutContainerRedirect children={jsx} debugKey={debugKey} />,
    )
}
