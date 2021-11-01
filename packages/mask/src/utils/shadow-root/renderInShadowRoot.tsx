import { createReactRootShadowedPartial, setupPortalShadowRoot } from '@masknet/theme'
import { untilDomLoaded } from '../dom'
import { Flags } from '../flags'
import { MaskUIRoot } from '../../UIRoot'
import { CSSVariableInjector } from './CSSVariableInjector'
import { useClassicMaskSNSTheme } from '..'

const captureEvents: (keyof HTMLElementEventMap)[] = [
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
untilDomLoaded().then(() => {
    setupPortalShadowRoot({ mode: Flags.using_ShadowDOM_attach_mode }, captureEvents)
})

// https://github.com/DimensionDev/Maskbook/issues/3265 with fast refresh or import order?
const createReactRootShadowed_raw = createReactRootShadowedPartial({
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
export function createReactRootShadowed(...args: Parameters<typeof createReactRootShadowed_raw>) {
    return createReactRootShadowed_raw(...args)
}
