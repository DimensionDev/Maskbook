import { createReactRootShadowedPartial, setupPortalShadowRoot, CSSVariableInjector } from '@masknet/theme'
import { Flags } from '../../../shared'
import { MaskUIRoot } from '../../UIRoot'
import { useClassicMaskSNSTheme } from '../theme'

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
export const setupShadowRootPortal = () => {
    const shadow = setupPortalShadowRoot({ mode: Flags.using_ShadowDOM_attach_mode })
    createReactRootShadowed(shadow, { key: 'css-vars' }).render(<CSSVariableInjector />)
}

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
