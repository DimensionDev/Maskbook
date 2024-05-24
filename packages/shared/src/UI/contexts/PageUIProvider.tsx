import { Suspense } from 'react'
import { StyledEngineProvider, type Theme } from '@mui/material'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { CSSVariableInjector, DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { compose, i18NextInstance } from '@masknet/shared-base'
import { ErrorBoundary } from '@masknet/shared-base-ui'

export function PageUIProvider(useTheme: () => Theme, children: React.ReactNode, fallback?: React.ReactNode) {
    return compose(
        // Avoid the crash due to unhandled suspense
        (children) => <Suspense children={children} />,
        // Provide the minimal environment (i18n context) for CrashUI in page mode
        (children) => <I18NextProviderHMR i18n={i18NextInstance} children={children} />,
        (children) => StyledEngineProvider({ injectFirst: true, children }),
        (children) => <ErrorBoundary children={children} />,
        (children) => <MaskUIRoot useTheme={useTheme} fallback={fallback} children={children} />,
        <>{children}</>,
    )
}

interface MaskUIRootProps extends React.PropsWithChildren {
    useTheme(): Theme
    fallback?: React.ReactNode
}

function MaskUIRoot({ children, useTheme, fallback }: MaskUIRootProps) {
    return (
        <DialogStackingProvider hasGlobalBackdrop={false}>
            <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useTheme}>
                <RootWeb3ContextProvider>
                    <SharedContextProvider>
                        <Suspense fallback={fallback}>
                            <CSSVariableInjector />
                            {children}
                        </Suspense>
                    </SharedContextProvider>
                </RootWeb3ContextProvider>
            </MaskThemeProvider>
        </DialogStackingProvider>
    )
}
