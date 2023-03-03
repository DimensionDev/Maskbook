import React, { useEffect, useState } from 'react'
import { ThemeProvider, StyledEngineProvider, Box } from '@mui/material'
import { MaskDarkTheme, MaskLightTheme, applyMaskColorVars, DisableShadowRootContext } from '@masknet/theme'
// Not compatible?
// import { withMatrix } from 'storybook-addon-matrix'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { CustomSnackbarProvider } from '../src/index.js'
import { i18NextInstance } from '@masknet/web3-shared-base'

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
                <DisableShadowRootContext.Provider value={true}>
                    <ThemeProvider theme={isDark ? MaskDarkTheme : MaskLightTheme}>
                        <CustomSnackbarProvider
                            disableWindowBlurListener={false}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                            <Box
                                sx={{
                                    background: isDark ? 'black' : 'white',
                                    marginTop: 2,
                                    height: 200,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <I18nextProvider i18n={i18NextInstance}>
                                    <Story />
                                </I18nextProvider>
                            </Box>
                        </CustomSnackbarProvider>
                    </ThemeProvider>
                </DisableShadowRootContext.Provider>
            </StyledEngineProvider>
        )
    },
]
