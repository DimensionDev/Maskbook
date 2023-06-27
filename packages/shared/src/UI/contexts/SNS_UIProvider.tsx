import { Suspense, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { EnvironmentContextProvider, Web3ContextProvider, TelemetryProvider } from '@masknet/web3-hooks-base'
import { DialogStackingProvider } from '@masknet/theme'
import { BuildInfo, queryClient, useValueRef } from '@masknet/shared-base-ui'
import { compose, getSiteType, i18NextInstance, NetworkPluginID, pluginIDsSettings } from '@masknet/shared-base'
import { buildInfoMarkdown } from '../../utils/BuildInfoMarkdown.js'
import { I18NextProviderHMR } from '../components/I18NextProviderHMR.js'

export function SNS_UIProvider(children: React.ReactNode) {
    return compose(
        // Avoid the crash due to unhandled suspense
        (children) => <Suspense children={children} />,
        (children) => <BuildInfo.Provider value={buildInfoMarkdown} children={children} />,
        <MaskUIRoot children={children} />,
    )
}

function MaskUIRoot({ children }: React.PropsWithChildren<{}>) {
    const site = getSiteType()
    const pluginIDs = useValueRef(pluginIDsSettings)

    const context = useMemo(() => {
        return { pluginID: site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM }
    }, [site, pluginIDs])

    return (
        <DialogStackingProvider hasGlobalBackdrop={false}>
            <EnvironmentContextProvider value={context}>
                <QueryClientProvider client={queryClient}>
                    {process.env.NODE_ENV === 'development'
                        ? createPortal(
                              <ReactQueryDevtools
                                  position="bottom-right"
                                  toggleButtonProps={{ style: { width: 24 } }}
                              />,
                              document.body,
                          )
                        : null}
                    <Web3ContextProvider value={context}>
                        <TelemetryProvider>
                            <I18NextProviderHMR i18n={i18NextInstance}>{children}</I18NextProviderHMR>
                        </TelemetryProvider>
                    </Web3ContextProvider>
                </QueryClientProvider>
            </EnvironmentContextProvider>
        </DialogStackingProvider>
    )
}
