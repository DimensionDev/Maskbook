import { type PaletteMode, useMediaQuery } from '@mui/material'

export function useSystemPreferencePalette(): PaletteMode {
    return useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
}
