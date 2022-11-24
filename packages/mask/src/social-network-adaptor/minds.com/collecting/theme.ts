import type { SocialNetworkUI as Next } from '@masknet/types'
import { ThemeMode } from '@masknet/web3-shared-base'
import { creator } from '../../../social-network/utils.js'
import { fromRGB, getBackgroundColor, isDark } from '../../../utils/index.js'

function resolveThemeSettingsInner(
    ref: Next.CollectingCapabilities.ThemeSettingsProvider['recognized'],
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

export const ThemeSettingsProviderMinds: Next.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    async start(cancel) {
        resolveThemeSettingsInner(this.recognized, cancel)
    },
}
