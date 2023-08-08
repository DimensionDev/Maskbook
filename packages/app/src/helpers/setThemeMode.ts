import type { PaletteMode } from '@mui/material'

export function setThemeMode(mode: PaletteMode | 'system', systemMode: PaletteMode) {
    if (mode === 'dark' || (mode === 'system' && systemMode === 'dark')) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}
