import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { RSS3_KEY_SNS } from '../constants'
import { RSS3Cache } from '../types'
import type { EnhanceableSite } from '@masknet/shared-base'
import { getAddress } from './kv'

function deleteTargetCache(userId: string, address: string, snsKey: RSS3_KEY_SNS) {
    const key = `${address}, ${userId}, ${snsKey}`
    RSS3Cache.delete(key)
}

export async function clearCache(
    userId: string,
    network: EnhanceableSite,
    snsKey: RSS3_KEY_SNS,
    networkPluginId?: NetworkPluginID,
    chainId?: number,
) {
    const address = await getAddress(network, userId, networkPluginId ?? NetworkPluginID.PLUGIN_EVM)

    if (address) {
        deleteTargetCache(userId, address, snsKey)
    }
}

export * from './storage'
export * from './kv'
