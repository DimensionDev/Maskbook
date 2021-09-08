import { ErrorBoundary } from '../../components/shared/ErrorBoundary'
import { applyMaskColorVars } from '@masknet/theme'
import { appearanceSettings } from '../../settings/settings'
import { getMaskbookTheme } from '../theme'
import { createReactRootShadowedPartial, setupPortalShadowRoot } from '@masknet/theme'
import { untilDomLoaded } from '../dom'
import { Flags } from '../flags'
import { MaskInShadow } from './MaskInShadow'

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
    onHeadCreate(head) {
        const themeCSSVars = head.appendChild(document.createElement('style'))
        function updateThemeVars() {
            applyMaskColorVars(themeCSSVars, getMaskbookTheme().palette.mode)
        }
        updateThemeVars()
        appearanceSettings.addListener(updateThemeVars)
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeVars)
    },
    wrapJSX(jsx) {
        return (
            <ErrorBoundary>
                <MaskInShadow>{jsx}</MaskInShadow>
            </ErrorBoundary>
        )
    },
})
export function createReactRootShadowed(...args: Parameters<typeof createReactRootShadowed_raw>) {
    return createReactRootShadowed_raw(...args)
}
