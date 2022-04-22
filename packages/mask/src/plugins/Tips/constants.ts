import { PluginId } from '@masknet/plugin-infra'
import { getRegisteredWeb3Networks } from '@masknet/plugin-infra/web3'

export const TipsEntrancePluginId = PluginId.Tip

const networks = getRegisteredWeb3Networks()

export const TipsSupportedChains = [
    { name: 'EVM Chain', icon: new URL('./assets/evmChains.png', import.meta.url), isEvm: true },
]
