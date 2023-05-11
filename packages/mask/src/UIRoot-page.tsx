import { Suspense, useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { StyledEngineProvider, type Theme } from '@mui/material'
import { EnvironmentContextProvider, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { TelemetryProvider } from '@masknet/web3-telemetry/hooks'
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { CSSVariableInjector, DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { ErrorBoundary, BuildInfo, useValueRef } from '@masknet/shared-base-ui'
import { compose, getSiteType, i18NextInstance, NetworkPluginID, queryClient } from '@masknet/shared-base'
import { buildInfoMarkdown } from './utils/BuildInfoMarkdown.js'
import { pluginIDSettings } from '../shared/legacy-settings/settings.js'

export function MaskUIRootPage(useTheme: () => Theme, children: React.ReactNode, fallback?: React.ReactNode) {
    return compose(
        // Avoid the crash due to unhandled suspense
        (children) => <Suspense children={children} />,
        (children) => <BuildInfo.Provider value={buildInfoMarkdown} children={children} />,

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
    const pluginIDs = useValueRef(pluginIDSettings)

    const context = useMemo(() => {
        return { pluginID: site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM }
    }, [site, pluginIDs])

    return (
        <DialogStackingProvider hasGlobalBackdrop={false}>
            <MaskThemeProvider useMaskIconPalette={(theme) => theme.palette.mode} useTheme={useTheme}>
                <EnvironmentContextProvider value={context}>
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
                </EnvironmentContextProvider>
            </MaskThemeProvider>
        </DialogStackingProvider>
    )
}
