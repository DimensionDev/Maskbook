import { getRegisteredWeb3Networks } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import type { NetworkDescriptor } from '@masknet/web3-shared-base'
import type { ChainId, NetworkType } from '@masknet/web3-shared-evm'

export function getEvmNetworks(testnet: boolean) {
    const list = getRegisteredWeb3Networks().filter(
        (x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM,
    ) as Array<NetworkDescriptor<ChainId, NetworkType>>
    return list.filter((x) => testnet || x.isMainnet)
}
