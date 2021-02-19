import React from 'react'
import { ThemeProvider, StylesProvider } from '@material-ui/core'
import { MaskDarkTheme, MaskLightTheme } from '../src/theme'
import { withMatrix } from 'storybook-addon-matrix'
import { addMaskThemeI18N } from '../src/locales'
import i18n from 'i18next'
import { I18nextProvider } from 'react-i18next'

addMaskThemeI18N(i18n)

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
}
export const decorators = [
    withMatrix,
    (Story) => (
        <StylesProvider injectFirst>
            <ThemeProvider theme={MaskLightTheme}>
                <I18nextProvider i18n={i18n}>
                    <Story />
                </I18nextProvider>
            </ThemeProvider>
        </StylesProvider>
    ),
]
