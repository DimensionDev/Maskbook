import type { SocialNetworkUI as Next } from '@masknet/types'
import { creator } from '../../../social-network/utils.js'

function resolveThemeSettingsInner(
    ref: Next.CollectingCapabilities.ThemeSettingsProvider['recognized'],
    cancel: AbortSignal,
) {}

export const ThemeSettingsProviderMinds: Next.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    start(cancel) {
        resolveThemeSettingsInner(this.recognized, cancel)
    },
}
