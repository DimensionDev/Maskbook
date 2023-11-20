import { useEffect } from 'react'
import { i18NextInstance, addI18NBundle } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { CSSVariableInjector, MaskLightTheme, MaskThemeProvider, DisableShadowRootContext } from '@masknet/theme'
import { StyledEngineProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { CalendarContent } from './CalendarContent.js'
import { languages } from '../locales/languages.js'
import { PLUGIN_ID } from '../constants.js'

function useTheme() {
    return MaskLightTheme
}

export function RenderCalendar() {
    useEffect(() => {
        addI18NBundle(i18NextInstance, PLUGIN_ID, languages)
    }, [])

    return (
        <DisableShadowRootContext.Provider value>
            <I18nextProvider i18n={i18NextInstance}>
                <StyledEngineProvider injectFirst>
                    <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useTheme}>
                        <QueryClientProvider client={queryClient}>
                            <CSSVariableInjector />
                            <CalendarContent />
                        </QueryClientProvider>
                    </MaskThemeProvider>
                </StyledEngineProvider>
            </I18nextProvider>
        </DisableShadowRootContext.Provider>
    )
}
