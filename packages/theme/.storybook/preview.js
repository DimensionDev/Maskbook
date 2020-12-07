import React from 'react'
import { ThemeProvider } from '@material-ui/core'
import { MaskDarkTheme, MaskLightTheme } from '../src/theme'
export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
}
export const decorators = [
    (Story) => (
        <ThemeProvider theme={MaskDarkTheme}>
            <Story />
        </ThemeProvider>
    ),
]
