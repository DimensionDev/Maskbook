import type { SiteAdaptorUI } from '@masknet/types'
import { fromRGB, getBackgroundColor } from '@masknet/theme'
import { ThemeMode } from '@masknet/web3-shared-base'
import { creator } from '../../../site-adaptor-infra/utils.js'

function isDark([r, g, b]: [number, number, number]) {
    return r < 68 && g < 68 && b < 68
}
function resolveThemeSettingsInner(
    ref: SiteAdaptorUI.CollectingCapabilities.ThemeSettingsProvider['recognized'],
    cancel: AbortSignal,
) {
    function updateThemeColor() {
        const backgroundColor = getBackgroundColor(document.body)
        ref.value = {
            ...ref.value,
            mode: isDark(fromRGB(backgroundColor)!) ? ThemeMode.Dark : ThemeMode.Light,
        }
    }

    updateThemeColor()

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            updateThemeColor()
        })
    })

    observer.observe(document.body, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['class'],
    })

    cancel.addEventListener('abort', () => observer.disconnect())
}

export const ThemeSettingsProviderMinds: SiteAdaptorUI.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    async start(cancel) {
        resolveThemeSettingsInner(ThemeSettingsProviderMinds.recognized, cancel)
    },
}
