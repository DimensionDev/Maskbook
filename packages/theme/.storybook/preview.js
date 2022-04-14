import React, { useEffect, useState } from 'react'
import { ThemeProvider, StyledEngineProvider, Box } from '@mui/material'
import { MaskDarkTheme, MaskLightTheme, applyMaskColorVars, DisableShadowRootContext } from '@masknet/theme'
// Not compatible?
// import { withMatrix } from 'storybook-addon-matrix'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { i18NextInstance } from '@masknet/shared-base'

initReactI18next.init(i18NextInstance)

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
}
export const decorators = [
    // withMatrix,
    (Story) => {
        const [isDark, setDark] = useState(false)
        useEffect(() => {
            applyMaskColorVars(document.body, isDark ? 'dark' : 'light')
        }, [isDark])
        return (
            <StyledEngineProvider injectFirst>
                <select onChange={(e) => setDark('dark' === e.currentTarget.value)}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
                <ThemeProvider theme={isDark ? MaskDarkTheme : MaskLightTheme}>
                    <Box sx={{ background: isDark ? 'black' : 'white' }}>
                        <I18nextProvider i18n={i18NextInstance}>
                            <DisableShadowRootContext.Provider value>
                                <Story />
                            </DisableShadowRootContext.Provider>
                        </I18nextProvider>
                    </Box>
                </ThemeProvider>
            </StyledEngineProvider>
        )
    },
]
