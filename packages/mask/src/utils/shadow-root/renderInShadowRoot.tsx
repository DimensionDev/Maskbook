import { ErrorBoundary } from '@masknet/shared-base-ui'
import {
    attachReactTreeToMountedRoot_noHost,
    setupReactShadowRootEnvironment as setupReactShadowRootEnvironmentUpper,
    CSSVariableInjector,
    GlobalBackdrop,
    MaskThemeProvider,
    usePortalShadowRoot,
} from '@masknet/theme'
import { Suspense } from 'react'
import { isFacebook } from '../../social-network-adaptor/facebook.com/base.js'
import { activatedSocialNetworkUI } from '../../social-network/ui.js'
import { createPortal } from 'react-dom'
import { MaskUIRoot, useMaskIconPalette } from '../../UIRoot.js'
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
    const shadow = setupReactShadowRootEnvironmentUpper(
        { mode: process.env.shadowRootMode },
        captureEvents,
        (children) => MaskUIRoot('sns', useClassicMaskSNSTheme, children),
    )
    attachReactTreeToGlobalContainer(shadow, { key: 'css-vars' }).render(
        <>
            <GlobalBackdrop />
            <CSSVariableInjector />
        </>,
    )
}

export const attachReactTreeToGlobalContainer = attachReactTreeToMountedRoot_noHost((children) => {
    return (
        <Suspense>
            <ErrorBoundary>
                <MaskThemeProvider
                    useMaskIconPalette={useMaskIconPalette}
                    CustomSnackbarOffsetY={isFacebook(activatedSocialNetworkUI) ? 80 : undefined}
                    useTheme={useClassicMaskSNSTheme}>
                    <CSSVariableInjector />
                    {children}
                </MaskThemeProvider>
            </ErrorBoundary>
        </Suspense>
    )
})

/** @deprecated Renamed to attachReactTreeToGlobalContainer */
export const createReactRootShadowed = attachReactTreeToGlobalContainer

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

    attachReactTreeToGlobalContainer(shadow, { signal, key: debugKey }).render(
        <AttachReactTreeWithoutContainerRedirect children={jsx} debugKey={debugKey} />,
    )
}
