import type { SocialNetworkUI as Next } from '@masknet/types'
import { ThemeMode } from '@masknet/web3-shared-base'
import { creator } from '../../../social-network/utils.js'

function resolveThemeSettingsInner(
    ref: Next.CollectingCapabilities.ThemeSettingsProvider['recognized'],
    cancel: AbortSignal,
) {
    function updateThemeColor(isDarkMode: boolean) {
        ref.value = {
            ...ref.value,
            mode: isDarkMode ? ThemeMode.Dark : ThemeMode.Light,
        }
    }

    updateThemeColor(document.documentElement.className.includes('dark-mode'))

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            updateThemeColor(!mutation.oldValue?.includes('dark-mode'))
        })
    })

    observer.observe(document.querySelector('html') as Node, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['class'],
    })

    cancel.addEventListener('abort', () => observer.disconnect())
}

export const ThemeSettingsProviderFacebook: Next.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    async start(cancel) {
        resolveThemeSettingsInner(this.recognized, cancel)
    },
}
