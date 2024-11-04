import React, { cloneElement, Suspense } from 'react'
import { StyledEngineProvider, type Theme } from '@mui/material'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { CSSVariableInjector, CustomSnackbarProvider, DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { LinguiProviderHMR, SharedContextProvider } from '@masknet/shared'
import { jsxCompose } from '@masknet/shared-base'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { i18n } from '@lingui/core'

export interface PageUIProviderProps {
    useTheme: () => Theme
    children?: React.ReactNode
    fallback?: React.ReactNode
}
export function PageUIProvider({ children, useTheme, fallback }: PageUIProviderProps) {
    return jsxCompose(
        // Avoid the crash due to unhandled suspense
        <Suspense />,
        // Provide the minimal environment (i18n context) for CrashUI in page mode
        <LinguiProviderHMR i18n={i18n} />,
        <StyledEngineProvider injectFirst />,
        <ErrorBoundary />,

        <Suspense fallback={fallback} />,
        <DialogStackingProvider hasGlobalBackdrop={false} />,
        <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useTheme} />,
        <RootWeb3ContextProvider />,
        <SharedContextProvider />,
        <CustomSnackbarProvider
            children={null!}
            disableWindowBlurListener={false}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        />,
    )(
        cloneElement,
        <>
            <CSSVariableInjector />
            {children}
        </>,
    )
}
