import { makeStyles } from '@masknet/theme'
import { blue, green, red } from '@mui/material/colors'
import type { MaskDarkTheme } from './MaskTheme'

export const useColorStyles = makeStyles()((theme: typeof MaskDarkTheme) => {
    const dark = theme.palette.mode === 'dark'
    return {
        error: {
            color: dark ? red[500] : red[900],
        },
        success: {
            color: dark ? green[500] : green[800],
        },
        info: {
            color: dark ? blue[500] : blue[800],
        },
    }
})
