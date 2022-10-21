import type { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { PluginIDContextProvider, Web3ContextProvider } from '@masknet/web3-hooks-base'
import type { FC, PropsWithChildren } from 'react'

interface Props {
    chainId: ChainId
}

export const RootContext: FC<PropsWithChildren<Props>> = ({ children, chainId }) => {
    return (
        <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
            <Web3ContextProvider value={{ chainId, pluginID: NetworkPluginID.PLUGIN_EVM }}>
                {children}
            </Web3ContextProvider>
        </PluginIDContextProvider>
    )
}
