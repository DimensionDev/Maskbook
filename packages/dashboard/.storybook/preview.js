// @ts-check
import React from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material'
import { applyMaskColorVars, CustomSnackbarProvider, DashboardDarkTheme } from '@masknet/theme'
import { addSharedI18N, I18NextProviderHMR } from '@masknet/shared'
import { addDashboardI18N } from '../src/locales/languages'
import { i18NextInstance } from '@masknet/shared-base'
import { DisableShadowRootContext } from '@masknet/theme'

addDashboardI18N(i18NextInstance)
addSharedI18N(i18NextInstance)

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
}
export const decorators = [
    (Story) => (
        <React.Suspense fallback="">
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={DashboardDarkTheme}>
                    <I18NextProviderHMR i18n={i18NextInstance}>
                        <DisableShadowRootContext.Provider value>
                            <CustomSnackbarProvider>
                                <Story />
                            </CustomSnackbarProvider>
                        </DisableShadowRootContext.Provider>
                    </I18NextProviderHMR>
                </ThemeProvider>
            </StyledEngineProvider>
        </React.Suspense>
    ),
]
applyMaskColorVars(document.body, 'light')
