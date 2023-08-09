import { Appearance } from '@masknet/public-api'
import type { PaletteMode } from '@mui/material'
import { useMemo } from 'react'

export function setThemeMode(mode: Appearance, systemMode: PaletteMode) {
    if (mode === Appearance.dark || (mode === Appearance.default && systemMode === 'dark')) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

export function useThemeMode(systemMode?: PaletteMode) {
    return useMemo(() => {
        return !localStorage.themeMode || localStorage.themeMode === Appearance.default
            ? systemMode ?? Appearance.light
            : localStorage.themeMode
    }, [localStorage.themeMode, systemMode])
}
