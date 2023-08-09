import { Appearance } from '@masknet/public-api'
import { useSystemPreferencePalette } from '@masknet/theme'
import type { PaletteMode } from '@mui/material'
import { useCallback, useMemo } from 'react'

export function setThemeMode1(mode: Appearance, systemMode: PaletteMode) {
    if (mode === Appearance.dark || (mode === Appearance.default && systemMode === 'dark')) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

export function useSaveThemeMode() {
    return useCallback((mode: Appearance) => {
        localStorage.themeMode = mode
    }, [])
}

export function useSetThemeMode() {
    const systemMode = useSystemPreferencePalette()

    return useCallback(
        (mode: Appearance) => {
            if (mode === Appearance.dark || (mode === Appearance.default && systemMode === 'dark')) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        },
        [systemMode],
    )
}

export function useThemeMode() {
    const systemMode = useSystemPreferencePalette()
    return useMemo(() => {
        return !localStorage.themeMode || localStorage.themeMode === Appearance.default
            ? systemMode
            : localStorage.themeMode
    }, [localStorage.themeMode, systemMode])
}

export function getThemeMode() {
    return localStorage.themeMode ?? Appearance.default
}
