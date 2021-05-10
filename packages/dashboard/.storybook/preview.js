import React from 'react'
import { ThemeProvider, StyledEngineProvider } from '@material-ui/core'
import { StylesProvider } from '@material-ui/styles'
import { MaskDarkTheme, MaskLightTheme, addMaskThemeI18N, applyMaskColorVars } from '@dimensiondev/maskbook-theme'
import { withMatrix } from 'storybook-addon-matrix'
import { addDashboardI18N } from '../src/locales'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import i18n from 'i18next'
i18n.init({
    resources: {},
    keySeparator: false,
    interpolation: { escapeValue: false },
    fallbackLng: 'en',
})
i18n.use(initReactI18next)
addDashboardI18N(i18n)
addMaskThemeI18N(i18n)
export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
}
export const decorators = [
    withMatrix,
    (Story) => (
        <StyledEngineProvider injectFirst>
            <StylesProvider>
                <ThemeProvider theme={MaskLightTheme}>
                    <I18nextProvider i18n={i18n}>
                        <Story />
                    </I18nextProvider>
                </ThemeProvider>
            </StylesProvider>
        </StyledEngineProvider>
    ),
]
applyMaskColorVars(document.body, 'light')
