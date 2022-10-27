import { ErrorBoundary } from '@masknet/shared-base-ui'
import {
    attachReactTreeToMountedRoot_noHost,
    setupReactShadowRootEnvironment as setupReactShadowRootEnvironmentUpper,
    CSSVariableInjector,
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
    const shadow = setupReactShadowRootEnvironmentUpper({ mode: process.env.shadowRootMode }, (jsx) =>
        MaskUIRoot({ children: jsx, useTheme: useClassicMaskSNSTheme, kind: 'sns' }),
    )
    attachReactTreeToGlobalContainer_inner(shadow, { key: 'css-vars' }).render(<CSSVariableInjector />)
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
