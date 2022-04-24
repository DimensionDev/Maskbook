import { NetworkPluginID } from '@masknet/plugin-infra/web3'

export function useSupportedNetworks(keys: NetworkPluginID[]) {
    // todo support solana flow when NextID supported
    const networkMap = {
        [NetworkPluginID.PLUGIN_EVM]: { name: 'Evm Chian', icon: new URL('../assets/evmChains.png', import.meta.url) },
        [NetworkPluginID.PLUGIN_FLOW]: { name: 'Solana Chain', icon: new URL('../assets/solana.png', import.meta.url) },
        [NetworkPluginID.PLUGIN_SOLANA]: { name: 'Flow Chain', icon: new URL('../assets/flow.png', import.meta.url) },
    }
    return keys.reduce((res: Array<{ name: string; icon: URL }>, x) => {
        res.push(networkMap[x])
        return res
    }, [])
}
