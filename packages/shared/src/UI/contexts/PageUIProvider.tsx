import { i18n } from '@lingui/core'
import { LinguiProviderHMR, SharedContextProvider } from '@masknet/shared'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { CSSVariableInjector, CustomSnackbarProvider, DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { StyledEngineProvider, type Theme } from '@mui/material'
import React, { Suspense } from 'react'
import { PrivySetup } from '../components/Privy/Setup'

export interface PageUIProviderProps {
    useTheme: () => Theme
    children?: React.ReactNode
    fallback?: React.ReactNode
}
export function PageUIProvider({ children, useTheme, fallback }: PageUIProviderProps) {
    /* prettier-ignore */
    return (
        <Suspense>
          <LinguiProviderHMR i18n={i18n}>
            <StyledEngineProvider injectFirst>
              <ErrorBoundary>
                <Suspense fallback={fallback}>
                  <DialogStackingProvider hasGlobalBackdrop={false}>
                    <MaskThemeProvider
                      useMaskIconPalette={(theme) => theme.palette.mode}
                      useTheme={useTheme}>
                      <RootWeb3ContextProvider>
                        <PrivySetup />
                        <SharedContextProvider>
                          <CustomSnackbarProvider
                            disableWindowBlurListener={false}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                            <CSSVariableInjector />
                            {children}
                          </CustomSnackbarProvider>
                        </SharedContextProvider>
                      </RootWeb3ContextProvider>
                    </MaskThemeProvider>
                  </DialogStackingProvider>
                </Suspense>
              </ErrorBoundary>
            </StyledEngineProvider>
          </LinguiProviderHMR>
        </Suspense>
    )
}
