import type { PaletteMode } from '@mui/material'
import { Appearance } from '@masknet/public-api'

export function getThemeMode() {
    return localStorage.themeMode ?? Appearance.default
}

export function setThemeMode(mode: Appearance, systemMode: PaletteMode) {
    if (mode === Appearance.dark || (mode === Appearance.default && systemMode === 'dark')) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }

    // persist theme mode
    localStorage.themeMode = mode
}
