import type { SiteAdaptorUI } from '@masknet/types'
import { creator } from '../../../social-network/utils.js'

function resolveThemeSettingsInner(
    ref: SiteAdaptorUI.CollectingCapabilities.ThemeSettingsProvider['recognized'],
    cancel: AbortSignal,
) {}

export const ThemeSettingsProviderInstagram: SiteAdaptorUI.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    async start(cancel) {
        resolveThemeSettingsInner(this.recognized, cancel)
    },
}
