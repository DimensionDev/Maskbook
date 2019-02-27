import { blue, purple } from '@material-ui/core/colors'
import withStyles, {
    WithStyles,
    WithStylesOptions,
    StyleRules,
    StyleRulesCallback,
} from '@material-ui/core/styles/withStyles'
import React from 'react'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'

// 主题
export const MaskbookLightTheme = createMuiTheme({
    palette: { primary: { main: '#486db6' }, secondary: { main: '#486db6' } },
    typography: {
        useNextVariants: true,
    },
})
export const MaskbookDarkTheme = createMuiTheme({
    palette: { primary: blue, secondary: purple, type: 'dark' },
    typography: {
        useNextVariants: true,
    },
})

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
