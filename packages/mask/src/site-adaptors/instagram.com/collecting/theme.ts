import type { SiteAdaptorUI } from '@masknet/types'
import { creator } from '../../../site-adaptor-infra/utils.js'
import { ThemeMode } from '@masknet/web3-shared-base'

function resolveThemeSettingsInner(
    ref: SiteAdaptorUI.CollectingCapabilities.ThemeSettingsProvider['recognized'],
    cancel: AbortSignal,
) {
    function updateThemeColor(isDarkMode: boolean) {
        ref.value = {
            ...ref.value,
            mode: isDarkMode ? ThemeMode.Dark : ThemeMode.Light,
        }
    }

    updateThemeColor(
        getComputedStyle(document.documentElement).getPropertyValue('--ig-primary-background') === '0, 0, 0',
    )

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            updateThemeColor(
                getComputedStyle(document.documentElement).getPropertyValue('--ig-primary-background') === '0, 0, 0',
            )
        })
    })

    observer.observe(document.querySelector('html') as Node, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['class'],
    })

    cancel.addEventListener('abort', () => observer.disconnect())
}

export const ThemeSettingsProviderInstagram: SiteAdaptorUI.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    async start(cancel) {
        resolveThemeSettingsInner(this.recognized, cancel)
    },
}
