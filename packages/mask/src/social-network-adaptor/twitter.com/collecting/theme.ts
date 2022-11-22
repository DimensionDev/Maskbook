import { delay } from '@masknet/kit'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createLookupTableResolver } from '@masknet/shared-base'
import type { SocialNetworkUI as Next } from '@masknet/types'
import { Twitter, TwitterBaseAPI } from '@masknet/web3-providers'
import { FontSize, ThemeMode } from '@masknet/web3-shared-base'
import { creator } from '../../../social-network/utils.js'
import { composeAnchorSelector } from '../utils/selector.js'

const resolveThemeColor = createLookupTableResolver<TwitterBaseAPI.ThemeColor, string>(
    {
        [TwitterBaseAPI.ThemeColor.Blue]: 'rgb(29, 155, 240)',
        [TwitterBaseAPI.ThemeColor.Yellow]: 'rgb(255, 212, 0)',
        [TwitterBaseAPI.ThemeColor.Purple]: 'rgb(120, 86, 255)',
        [TwitterBaseAPI.ThemeColor.Magenta]: 'rgb(249, 24, 128)',
        [TwitterBaseAPI.ThemeColor.Orange]: 'rgb(255, 122, 0)',
        [TwitterBaseAPI.ThemeColor.Green]: 'rgb(0, 186, 124)',
    },
    'rgb(29, 155, 240)',
)

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
        await delay(2000)
        const userSettings = await Twitter.getUserSettings(true)
        if (!userSettings) return

        ref.value = {
            color: userSettings.themeColor ? resolveThemeColor(userSettings.themeColor) : ref.value.color,
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
