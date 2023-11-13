import { MaskColors } from './colors.js'
import type { PaletteMode, ThemeOptions } from '@mui/material'
import { createTheme } from '@mui/material'
import { merge } from 'lodash-es'
import * as Components from './component-changes.js'
import { grey } from '@mui/material/colors'

function MaskTheme(mode: PaletteMode) {
    const maskColors = MaskColors[mode]
    const theme = merge(
        {
            palette: {
                ...maskColors,
                primary: { main: '#1c68f3' },
                text: {
                    ...maskColors.text,
                    hint: 'rgba(0, 0, 0, 0.38)',
                },
            },
            typography: {
                fontFamily: 'Helvetica',
            },
            breakpoints: {
                values: {
                    xs: 0,
                    sm: 600,
                    md: 1112,
                    lg: 1280,
                    xl: 1920,
                },
            },
            components: {
                MuiLink: { defaultProps: { underline: 'hover' } },
                MuiTab: {
                    styleOverrides: {
                        root: {
                            textTransform: 'unset',
                            padding: '0',
                            // up-sm
                            '@media screen and (min-width: 600px)': {
                                minWidth: 160,
                            },
                        },
                    },
                },
                MuiDialog: {
                    styleOverrides: {
                        paper: {
                            borderRadius: '12px',
                        },
                    },
                },
                MuiTypography: {
                    styleOverrides: {
                        root: {
                            fontSize: 14,
                        },
                    },
                },
            },
        },
        mode === 'dark' ?
            {
                palette: {
                    mode: 'dark',
                    background: {
                        paper: grey[900],
                    },
                },
                components: {
                    MuiPaper: {
                        // https://github.com/mui-org/material-ui/pull/25522
                        styleOverrides: { root: { backgroundImage: 'unset' } },
                    },
                },
            }
        :   {},
        ...Object.values(Components).map(applyColors),
    ) as ThemeOptions

    return createTheme(theme)
    function applyColors(x: any) {
        if (typeof x === 'function') return x(mode, maskColors)
        return x
    }
}

export const MaskLightTheme = MaskTheme('light')
export const MaskDarkTheme = MaskTheme('dark')
