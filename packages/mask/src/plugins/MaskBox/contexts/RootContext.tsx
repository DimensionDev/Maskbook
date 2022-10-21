import type { FC, PropsWithChildren } from 'react'
import type { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { NetworkContextProvider, ChainContextProvider } from '@masknet/web3-hooks-base'

interface Props {
    chainId: ChainId
}

export const RootContext: FC<PropsWithChildren<Props>> = ({ children, chainId }) => {
    return (
        <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
            <ChainContextProvider value={{ chainId }}>{children}</ChainContextProvider>
        </NetworkContextProvider>
    )
}
