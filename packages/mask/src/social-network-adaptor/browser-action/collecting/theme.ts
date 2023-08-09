import type { SiteAdaptorUI } from '@masknet/types'
import { creator } from '../../../social-network/utils.js'

export const ThemeSettingsProviderDefault: SiteAdaptorUI.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    async start(signal) {},
}
