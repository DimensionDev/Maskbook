import { createMuiTheme } from '@material-ui/core'
import { TypographyOptions } from '@material-ui/core/styles/createTypography'
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme'

const _refTheme = createMuiTheme()
const _refThemeDark = createMuiTheme({ palette: { type: 'dark' } })
const baseTheme = (theme: 'dark' | 'light') =>
    ({
        palette: {
            primary: { main: '#486db6' },
            secondary: { main: '#486db6' },
            type: theme,
            background: {
                default: theme === 'light' ? '#eeeeef' : _refThemeDark.palette.background.default,
            },
        },
        shape: { borderRadius: 3 },
        typography: {
            caption: {
                color: '#4b4f56',
                letterSpacing: 'initial',
                fontWeight: 'normal',
                lineHeight: '14px',
            },
            h6: {
                fontWeight: 'normal',
            },
        } as TypographyOptions,
        overrides: {
            MuiButton: {
                root: {
                    textTransform: 'none',
                    padding: _refTheme.spacing(1, 3),
                },
                outlined: {
                    background: theme === 'light' ? 'white' : _refThemeDark.palette.background.default,
                    padding: _refTheme.spacing(1, 3),
                },
            },
            MuiCard: {
                root: {
                    borderRadius: 3,
                },
            },
            MuiCardHeader: {
                root: {
                    background: '#f5f6f7',
                    width: '100%',
                    padding: '8px 24px 8px 8px',
                },
            },
        },
    } as ThemeOptions)
// 主题
export const MaskbookLightTheme = createMuiTheme(baseTheme('light'))
export const MaskbookDarkTheme = createMuiTheme(baseTheme('dark'))
export const FixedWidthFonts = `Droid Sans Mono', Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif`
