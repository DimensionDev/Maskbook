import React from 'react'
import { ThemeProvider, StylesProvider } from '@material-ui/core'
import { MaskDarkTheme, MaskLightTheme } from '../src/theme'
import { withMatrix } from 'storybook-addon-matrix'
import { addMaskThemeI18N } from '../src/locales'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
i18n.init({
    resources: {},
    keySeparator: false,
    interpolation: { escapeValue: false },
    fallbackLng: 'en',
})
i18n.use(initReactI18next)
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
