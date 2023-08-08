import { Appearance } from '@masknet/public-api'
import type { PaletteMode } from '@mui/material'

export function setThemeMode(mode: Appearance, systemMode: PaletteMode) {
    if (mode === Appearance.dark || (mode === Appearance.default && systemMode === 'dark')) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}
