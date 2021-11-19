import { createReactRootShadowedPartial, setupPortalShadowRoot, CSSVariableInjector } from '@masknet/theme'
import { untilDomLoaded } from '../dom'
import { Flags } from '../../../shared'
import { MaskUIRoot } from '../../UIRoot'
import { useClassicMaskSNSTheme } from '../theme'
import { createRoot } from 'react-dom'

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
    const shadow = setupPortalShadowRoot({ mode: Flags.using_ShadowDOM_attach_mode }, captureEvents)
    createRoot(shadow.appendChild(document.createElement('head'))).render(
        <main>
            <head />
            <CSSVariableInjector useTheme={useClassicMaskSNSTheme} />
        </main>,
    )
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
