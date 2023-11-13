import type { Theme } from '@mui/material'
import { getBackgroundColor } from '../utils/theme/color-tools.js'

export function useSiteThemeMode(theme: Theme) {
    const backgroundColor = getBackgroundColor(document.body)
    const isDark = theme.palette.mode === 'dark'
    const isDarker = backgroundColor === 'rgb(0,0,0)'

    return (
        isDark ?
            !isDarker ? 'dim'
            :   'dark'
        :   'light'
    )
}
