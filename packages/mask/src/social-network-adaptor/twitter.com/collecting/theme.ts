import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createLookupTableResolver } from '@masknet/shared-base'
import type { SocialNetworkUI as Next } from '@masknet/types'
import { Twitter, TwitterBaseAPI } from '@masknet/web3-providers'
import { FontSize, ThemeMode } from '@masknet/web3-shared-base'
import { creator } from '../../../social-network/utils.js'
import { composeAnchorSelector } from '../utils/selector.js'

const resolveThemeMode = createLookupTableResolver<TwitterBaseAPI.ThemeMode, ThemeMode>(
    {
        [TwitterBaseAPI.ThemeMode.Dark]: ThemeMode.Dark,
        [TwitterBaseAPI.ThemeMode.Dim]: ThemeMode.Dim,
        [TwitterBaseAPI.ThemeMode.Light]: ThemeMode.Light,
    },
    ThemeMode.Light,
)

const resolveFontSize = createLookupTableResolver<TwitterBaseAPI.Scale, FontSize>(
    {
        [TwitterBaseAPI.Scale.X_Large]: FontSize.X_Large,
        [TwitterBaseAPI.Scale.Large]: FontSize.Large,
        [TwitterBaseAPI.Scale.Normal]: FontSize.Normal,
        [TwitterBaseAPI.Scale.Small]: FontSize.Small,
        [TwitterBaseAPI.Scale.X_Small]: FontSize.X_Small,
    },
    FontSize.Normal,
)

function resolveThemeSettingsInner(
    ref: Next.CollectingCapabilities.ThemeSettingsProvider['recognized'],
    cancel: AbortSignal,
) {
    const assign = async () => {
        const userSettings = await Twitter.getUserSettings()
        if (!userSettings) return
        ref.value = {
            color: userSettings.themeColor ?? ref.value.color,
            size: userSettings.scale ? resolveFontSize(userSettings.scale) : ref.value.size,
            mode: userSettings.themeBackground ? resolveThemeMode(userSettings.themeBackground) : ref.value.mode,
        }
    }

    const createWatcher = (selector: LiveSelector<HTMLElement, boolean>) => {
        new MutationObserverWatcher(selector)
            .addListener('onAdd', () => assign())
            .addListener('onChange', () => assign())
            .startWatch(
                {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['src'],
                },
                cancel,
            )
    }

    assign()

    createWatcher(composeAnchorSelector())
}

export const ThemeSettingsProviderTwitter: Next.CollectingCapabilities.ThemeSettingsProvider = {
    recognized: creator.EmptyThemeSettingsProviderState(),
    start(cancel) {
        resolveThemeSettingsInner(this.recognized, cancel)
    },
}
