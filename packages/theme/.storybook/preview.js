import React from 'react'
import { ThemeProvider } from '@material-ui/core'
import { MaskDarkTheme, MaskLightTheme } from '../src/theme'
import { withMatrix } from 'storybook-addon-matrix'

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
}
export const decorators = [
    withMatrix,
    (Story) => (
        <ThemeProvider theme={MaskLightTheme}>
            <Story />
        </ThemeProvider>
    ),
]
