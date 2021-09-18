import React, { useEffect, useState } from 'react'
import { ThemeProvider, StyledEngineProvider, Box } from '@mui/material'
import { MaskDarkTheme, MaskLightTheme, applyMaskColorVars } from '../src/index'
// Not compatible?
// import { withMatrix } from 'storybook-addon-matrix'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import i18n from 'i18next'

i18n.init({
    keySeparator: false,
    interpolation: { escapeValue: false },
    // TODO: use fallbackLng from shared-base package
    fallbackLng: 'en-US',
    nonExplicitSupportedLngs: true,
})
i18n.use(initReactI18next)
export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
}
export const decorators = [
    // withMatrix,
    (Story) => {
        const [isDark, setIsDark] = useState(false)
        useEffect(() => {
            applyMaskColorVars(document.body, isDark ? 'dark' : 'light')
        }, [isDark])
        return (
            <StyledEngineProvider injectFirst>
                <select onChange={(e) => setIsDark('dark' === e.currentTarget.value)}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
                <ThemeProvider theme={isDark ? MaskDarkTheme : MaskLightTheme}>
                    <Box sx={{ background: isDark ? 'black' : 'white' }}>
                        <I18nextProvider i18n={i18n}>
                            <Story />
                        </I18nextProvider>
                    </Box>
                </ThemeProvider>
            </StyledEngineProvider>
        )
    },
]
