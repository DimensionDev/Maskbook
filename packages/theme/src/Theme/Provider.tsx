import {
    CssBaseline,
    type Theme,
    ThemeProvider,
    type PaletteMode,
    useColorScheme,
    type StorageManager,
    unstable_createMuiStrictModeTheme,
} from '@mui/material'
import { MaskIconPaletteContext } from '@masknet/icons'
import { MaskTheme } from './theme.js'
import type { Localization } from '@mui/material/locale'
import { useEffect, useMemo, useRef } from 'react'

export interface MaskThemeProviderProps extends React.PropsWithChildren {
    theme?: Theme
    localization?: Localization
    palette: PaletteMode
    supportsDimPalette?: boolean
}

function useStorageManager(palette: PaletteMode): StorageManager {
    const storageManagerRef = useRef<StorageManager>(null)
    const storageManagerCallbackRef = useRef<Set<(value: PaletteMode) => void>>(new Set())
    useEffect(() => {
        for (const callback of storageManagerCallbackRef.current) {
            callback(palette)
        }
    }, [palette])
    if (!storageManagerRef.current) {
        storageManagerRef.current = () => ({
            get: () => palette,
            set: () => {
                // ignore, we managed it by ourselves
            },
            subscribe: (callback) => {
                storageManagerCallbackRef.current.add(callback)
                return () => {
                    storageManagerCallbackRef.current.delete(callback)
                }
            },
        })
    }
    return storageManagerRef.current
}

export function MaskThemeProvider(props: MaskThemeProviderProps) {
    const { children, theme = MaskTheme, palette, localization, supportsDimPalette } = props
    const outerColorScheme = useColorScheme()
    const outerPalette =
        outerColorScheme.mode === 'system' ? outerColorScheme.systemMode : outerColorScheme.mode
    const hasDifferentOuterPalette =
        outerColorScheme.allColorSchemes.length > 0 && outerPalette !== undefined && outerPalette !== palette
    const storageManager = useStorageManager(palette)

    const themeWithLocalization = useMemo(() => {
        if (!localization) return theme
        return unstable_createMuiStrictModeTheme(theme, localization)
    }, [theme, localization])

    return (
        <ThemeProvider
            theme={themeWithLocalization}
            storageManager={storageManager}
            disableNestedContext={hasDifferentOuterPalette}>
            <MaskIconPaletteContext value={palette}>
                <CssBaseline />
                {children}
            </MaskIconPaletteContext>
        </ThemeProvider>
    )
}
export function usePalette(): PaletteMode {
    const { mode, systemMode } = useColorScheme()
    return (mode === 'system' ? systemMode : mode) || 'light'
}
