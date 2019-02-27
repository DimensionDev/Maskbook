import { blue, purple } from '@material-ui/core/colors'
import withStyles, {
    WithStyles,
    WithStylesOptions,
    StyleRules,
    StyleRulesCallback,
} from '@material-ui/core/styles/withStyles'
import React from 'react'
import createMuiTheme, { ThemeOptions } from '@material-ui/core/styles/createMuiTheme'

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
        shape: { borderRadius: 10 },
        typography: {
            useNextVariants: true,
        },
        overrides: {
            MuiButton: {
                root: {
                    textTransform: 'none',
                    padding: `${_refTheme.spacing.unit}px ${_refTheme.spacing.unit * 3}px`,
                },
                outlined: {
                    background: theme === 'light' ? 'white' : _refThemeDark.palette.background.default,
                    padding: `${_refTheme.spacing.unit}px ${_refTheme.spacing.unit * 3}px`,
                },
            },
        },
    } as ThemeOptions)
// 主题
export const MaskbookLightTheme = createMuiTheme(baseTheme('light'))
export const MaskbookDarkTheme = createMuiTheme(baseTheme('dark'))
export const FixedWidthFonts = `Droid Sans Mono', Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif`
// 类型安全的 withStyles
export function withStylesTyped<ClassKey extends string, Options extends WithStylesOptions<ClassKey> = {}>(
    style: StyleRulesCallback<ClassKey> | StyleRules<ClassKey>,
    options?: Options,
) {
    return function<Props, Ref = null>(
        component: Ref extends null
            ? React.ComponentType<Props & WithStyles<typeof style>>
            : React.ForwardRefExoticComponent<Props & WithStyles<typeof style> & React.RefAttributes<Ref>>,
    ) {
        return withStyles(style, options as any)(component as any) as Ref extends null
            ? React.ComponentType<Props>
            : React.ForwardRefExoticComponent<React.RefAttributes<Ref> & Props>
    }
}
