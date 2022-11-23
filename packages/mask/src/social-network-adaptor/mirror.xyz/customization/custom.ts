import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import type { PaletteMode } from '@mui/material'
import { themeSelector } from '../utils/selectors.js'

const currentTheme = new ValueRef<PaletteMode>('light')

export async function startWatchThemeColor(signal: AbortSignal) {
    function updateThemeColor() {
        currentTheme.value = (document.documentElement.dataset.theme as PaletteMode) ?? 'light'
    }

    new MutationObserverWatcher(themeSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch({ childList: true, subtree: true }, signal)
}
