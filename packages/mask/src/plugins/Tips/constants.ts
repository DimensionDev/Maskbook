import { PluginId, getRegisteredWeb3Networks, NetworkPluginID } from '@masknet/plugin-infra'
export const TipsEnterancePluginId = PluginId.Tip

const networks = getRegisteredWeb3Networks()

const getNetworkIcon = (id: string) => {
    const icon = networks.find((x) => x.ID === id).icon
    console.log(icon, 'ggg')
    return icon
}

export const TipsSupportedChains = [
    { name: 'EVM Chain', icon: getNetworkIcon(`${NetworkPluginID.PLUGIN_EVM}_ethereum`) },
    { name: 'Flow Chain', icon: getNetworkIcon(`${NetworkPluginID.PLUGIN_FLOW}_flow`) },
    { name: 'Solana Chain', icon: getNetworkIcon(`${NetworkPluginID.PLUGIN_SOLANA}_solana`) },
]
