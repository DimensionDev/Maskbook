import type { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { NetworkContextProvider, ChainContextProvider } from '@masknet/web3-hooks-base'
import type { FC, PropsWithChildren } from 'react'

interface Props {
    chainId: ChainId
}

export const RootContext: FC<PropsWithChildren<Props>> = ({ children, chainId }) => {
    return (
        <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
            <ChainContextProvider value={{ chainId, pluginID: NetworkPluginID.PLUGIN_EVM }}>
                {children}
            </ChainContextProvider>
        </NetworkContextProvider>
    )
}
