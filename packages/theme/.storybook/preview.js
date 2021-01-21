import React from 'react'
import { ThemeProvider, StylesProvider } from '@material-ui/core'
import { MaskDarkTheme, MaskLightTheme } from '../src/theme'
import { withMatrix } from 'storybook-addon-matrix'

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
}
export const decorators = [
    withMatrix,
    (Story) => (
        <StylesProvider injectFirst>
            <ThemeProvider theme={MaskLightTheme}>
                <Story />
            </ThemeProvider>
        </StylesProvider>
    ),
]
