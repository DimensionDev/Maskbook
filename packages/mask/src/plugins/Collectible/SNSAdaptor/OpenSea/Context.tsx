import { PluginIDContextProvider, PluginWeb3ContextProvider } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export interface OpenSeaContextProps {
    chainId?: ChainId
}

export function OpenSeaContext({ chainId = ChainId.Mainnet }: OpenSeaContextProps & React.ProviderProps<{}>) {
    return (
        <PluginIDContextProvider value={NetworkPluginID.PLUGIN_EVM}>
            <PluginWeb3ContextProvider
                pluginID={NetworkPluginID.PLUGIN_EVM}
                value={{
                    chainId,
                }}></PluginWeb3ContextProvider>
        </PluginIDContextProvider>
    )
}
