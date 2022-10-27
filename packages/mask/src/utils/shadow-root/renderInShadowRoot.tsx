import { ErrorBoundary } from '@masknet/shared-base-ui'
import {
    attachReactTreeToMountedRoot_noHost,
    setupReactShadowRootEnvironment as setupReactShadowRootEnvironmentUpper,
    CSSVariableInjector,
    DialogStackingProvider,
    GlobalBackdrop,
} from '@masknet/theme'
import { Suspense } from 'react'
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
    const shadow = setupReactShadowRootEnvironmentUpper({ mode: process.env.shadowRootMode }, (jsx) => (
        <MaskUIRoot useTheme={useClassicMaskSNSTheme} kind="sns">
            <DialogStackingProvider hasGlobalBackdrop>{jsx}</DialogStackingProvider>
        </MaskUIRoot>
    ))
    attachReactTreeToGlobalContainer_inner(shadow, { key: 'css-vars' }).render(
        <>
            <GlobalBackdrop />
            <CSSVariableInjector />
        </>,
    )
}

// https://github.com/DimensionDev/Maskbook/issues/3265 with fast refresh or import order?
const attachReactTreeToGlobalContainer_inner = attachReactTreeToMountedRoot_noHost({
    preventEventPropagationList: captureEvents,
    wrapJSX(jsx) {
        return (
            <Suspense fallback={null}>
                <ErrorBoundary>{jsx}</ErrorBoundary>
            </Suspense>
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
