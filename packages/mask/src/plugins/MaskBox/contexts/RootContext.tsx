import type { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { PluginWeb3ContextProvider, PluginIDContextProvider } from '@masknet/web3-hooks-base'
import type { FC, PropsWithChildren } from 'react'

interface Props {
    chainId: ChainId
}

export const RootContext: FC<PropsWithChildren<Props>> = ({ children, chainId }) => {
    return (
        <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
            <PluginWeb3ContextProvider pluginID={NetworkPluginID.PLUGIN_EVM} value={{ chainId }}>
                {children}
            </PluginWeb3ContextProvider>
        </PluginIDContextProvider>
    )
}
