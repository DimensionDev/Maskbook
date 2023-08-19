import { Suspense, useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { StyledEngineProvider, type Theme } from '@mui/material'
import { Web3ContextProvider, TelemetryProvider } from '@masknet/web3-hooks-base'
import { CSSVariableInjector, DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { compose, getSiteType, i18NextInstance, NetworkPluginID, pluginIDsSettings } from '@masknet/shared-base'
import { ErrorBoundary, queryClient, useValueRef } from '@masknet/shared-base-ui'

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

interface MaskUIRootProps extends React.PropsWithChildren<{}> {
    useTheme(): Theme
    fallback?: React.ReactNode
}

function MaskUIRoot({ children, useTheme, fallback }: MaskUIRootProps) {
    const site = getSiteType()
    const pluginIDs = useValueRef(pluginIDsSettings)

    const context = useMemo(() => {
        return { pluginID: site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM }
    }, [site, pluginIDs])

    return (
        <DialogStackingProvider hasGlobalBackdrop={false}>
            <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useTheme}>
                <QueryClientProvider client={queryClient}>
                    <Web3ContextProvider value={context}>
                        <TelemetryProvider>
                            <SharedContextProvider>
                                <Suspense fallback={fallback}>
                                    <CSSVariableInjector />
                                    {children}
                                </Suspense>
                            </SharedContextProvider>
                        </TelemetryProvider>
                    </Web3ContextProvider>
                </QueryClientProvider>
            </MaskThemeProvider>
        </DialogStackingProvider>
    )
}
