import { useSystemPreferencePalette } from '@masknet/theme'
import { useAppearance } from './useAppearance.ts'
import { Appearance } from '@masknet/public-api'
import type { PaletteMode } from '@mui/material'

export function usePageThemePalette(): PaletteMode {
    const appearance = useAppearance()
    const mode = useSystemPreferencePalette()
    return appearance === Appearance.default ? mode : appearance
}
