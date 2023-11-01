import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import type { SiteAdaptorUI } from '@masknet/types'
import { ThemeMode } from '@masknet/web3-shared-base'
import { creator } from '../../../site-adaptor-infra/utils.js'
import { themeSelector } from '../utils/selectors.js'

function resolveThemeSettingsInner(
    ref: SiteAdaptorUI.CollectingCapabilities.ThemeSettingsProvider['recognized'],
    cancel: AbortSignal,
) {
    function updateThemeColor() {
        ref.value = {
            ...ref.value,
            mode: (document.documentElement.dataset.theme as ThemeMode) ?? ThemeMode.Light,
        }
    }

    updateThemeColor()

    new MutationObserverWatcher(themeSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch({ childList: true, subtree: true }, cancel)
}

export const ThemeSettingsProviderMirror: SiteAdaptorUI.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    async start(cancel) {
        resolveThemeSettingsInner(this.recognized, cancel)
    },
}
