import type { SocialNetworkUI as Next } from '@masknet/types'
import { creator } from '../../../social-network/utils.js'

function resolveThemeSettingsInner(
    ref: Next.CollectingCapabilities.ThemeSettingsProvider['recognized'],
    cancel: AbortSignal,
) {}

export const ThemeSettingsProviderInstagram: Next.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    async start(cancel) {
        resolveThemeSettingsInner(this.recognized, cancel)
    },
}
