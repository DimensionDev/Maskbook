import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { getUserAddress } from './bind'
import type { RSS3_KEY_SNS } from '../constants'
import { RSS3Cache } from '../types'

function deleteTargetCache(userId: string, address: string, snsKey: RSS3_KEY_SNS) {
    const key = `${address}, ${userId}, ${snsKey}`
    RSS3Cache.delete(key)
}

export async function clearCache(
    userId: string,
    network: string,
    snsKey: RSS3_KEY_SNS,
    networkPluginId?: NetworkPluginID,
    chainId?: number,
) {
    const address = await getUserAddress(userId, network, networkPluginId, chainId)
    if (address) {
        deleteTargetCache(userId, address, snsKey)
    }
}

export async function getAddress(userId: string, network: string, networkPluginId?: NetworkPluginID, chainId?: number) {
    if (!userId) return ''
    const address = await getUserAddress(userId, network, networkPluginId, chainId)
    return (address ?? '') as string
}

export * from './bind'
export * from './storage'
