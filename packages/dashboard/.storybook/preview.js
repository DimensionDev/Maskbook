import React from 'react'
import { ThemeProvider } from '@material-ui/core'
// TODO: we should depend on @dimensiondev/maskbook-theme but bundler need bundle node_modules/@dimensiondev too
import { MaskDarkTheme, MaskLightTheme } from '../../theme/src/theme'
export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
}
export const decorators = [
    (Story) => (
        <ThemeProvider theme={MaskLightTheme}>
            <Story />
        </ThemeProvider>
    ),
]
