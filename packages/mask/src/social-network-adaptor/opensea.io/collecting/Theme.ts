import type { SocialNetworkUI as Next } from '@masknet/types'
import { creator } from '../../../social-network/utils.js'

export const ThemeSettingsProviderOpenSea: Next.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    async start(cancel) {},
}
