import { getRegisteredWeb3Networks } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'

export function getEvmNetworks(testnet: boolean) {
    const list = getRegisteredWeb3Networks(NetworkPluginID.PLUGIN_EVM)
    return list.filter((x) => testnet || x.isMainnet)
}
