import { ChainId, isSameAddress } from '@masknet/web3-shared-evm'
import { NFT_AVATAR_GUN_SERVER } from '../constants'
import { NetworkPluginID } from '@masknet/plugin-infra'
import addSeconds from 'date-fns/addSeconds'
import isBefore from 'date-fns/isBefore'
import { KeyValue } from '@masknet/web3-providers'

const NFTAvatarDB = KeyValue.createJSON_Storage(NFT_AVATAR_GUN_SERVER)

const cache = new Map<string, [Promise<string | undefined>, Date]>()

async function _getUserAddress(userId: string, networkPluginId?: NetworkPluginID, chainId?: ChainId) {
    const result = await NFTAvatarDB.get<Record<string, string>>(userId)
    return result?.[`${networkPluginId ?? NetworkPluginID.PLUGIN_EVM}-${chainId ?? ChainId.Mainnet}`]
}

export async function getUserAddress(userId: string, networkPluginId?: NetworkPluginID, chainId?: ChainId) {
    let c = cache.get(userId)
    if (!c || isBefore(new Date(), c[1])) {
        cache.set(userId, [_getUserAddress(userId, networkPluginId, chainId), addSeconds(new Date(), 60)])
    }
    c = cache.get(userId)
    return c?.[0]
}

export async function setUserAddress(
    userId: string,
    address: string,
    networkPluginId?: NetworkPluginID,
    chainId?: ChainId,
) {
    try {
        await NFTAvatarDB.set<Record<string, string>>(userId, {
            [`${networkPluginId ?? NetworkPluginID.PLUGIN_EVM}-${chainId ?? ChainId.Mainnet}`]: address,
        })
    } catch {
        // do nothing
    } finally {
        const _address = await getUserAddress(userId, networkPluginId, chainId)
        if (!isSameAddress(_address, address))
            throw new Error('Something went wrong, and please check your connection.')
    }
}
