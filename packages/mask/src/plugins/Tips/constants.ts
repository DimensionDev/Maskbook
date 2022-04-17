import { PluginId } from '@masknet/plugin-infra'
import { getRegisteredWeb3Networks, NetworkPluginID } from '@masknet/plugin-infra/web3'

export const TipsEnterancePluginId = PluginId.Tip

const networks = getRegisteredWeb3Networks()

const getNetworkIcon = (id: string) => {
    const item = networks.find((x) => x.ID === id)
    if (!item) return null
    return item.icon
}

export const TipsSupportedChains = [
    { name: 'EVM Chain', icon: new URL('./assets/evmChains.png', import.meta.url), isEvm: true },
    { name: 'Flow Chain', icon: getNetworkIcon(`${NetworkPluginID.PLUGIN_FLOW}_flow`) },
    { name: 'Solana Chain', icon: getNetworkIcon(`${NetworkPluginID.PLUGIN_SOLANA}_solana`) },
]
