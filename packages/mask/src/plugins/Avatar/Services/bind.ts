import { ChainId, isSameAddress } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/plugin-infra'
import addSeconds from 'date-fns/addSeconds'
import { KeyValue } from '@masknet/web3-providers'
import { NFT_AVATAR_DB_NAME, NFT_AVATAR_DB_NAME_STORAGE } from '../constants'

const NFTAvatarDB = KeyValue.createJSON_Storage(NFT_AVATAR_DB_NAME)
const NFTAvatarDBStorage = KeyValue.createJSON_Storage(NFT_AVATAR_DB_NAME_STORAGE)

const cache = new Map<string, [Promise<string | undefined>, number]>()

async function _getUserAddress(userId: string, networkPluginId?: NetworkPluginID, chainId?: number) {
    try {
        const result = await NFTAvatarDB.get<{ networkPluginId: string; chainId: number; address: string }>(userId)
        if (!result || !result?.address) {
            const result = await NFTAvatarDBStorage.get<Record<string, string>>(userId)
            return result?.[`${networkPluginId ?? NetworkPluginID.PLUGIN_EVM}-${chainId ?? ChainId.Mainnet}`]
        }
        return result.address
    } catch {
        return
    }
}

export async function getUserAddress(userId: string, networkPluginId?: NetworkPluginID, chainId?: number) {
    const key = `${userId}-${networkPluginId ?? NetworkPluginID.PLUGIN_EVM}-${chainId ?? ChainId.Mainnet}`
    let c = cache.get(key)
    if (!c || Date.now() > c[1]) {
        try {
            cache.set(key, [_getUserAddress(userId, networkPluginId, chainId), addSeconds(new Date(), 60).getTime()])
        } catch (err) {
            console.log(err)
        }
    }
    c = cache.get(key)

    return c?.[0]
}

export async function setUserAddress(
    userId: string,
    address: string,
    networkPluginId?: NetworkPluginID,
    chainId?: number,
) {
    try {
        await NFTAvatarDBStorage.set<Record<string, string>>(userId, {
            [`${networkPluginId ?? NetworkPluginID.PLUGIN_EVM}-${chainId ?? ChainId.Mainnet}`]: address,
        })

        await NFTAvatarDB.set<{ networkPluginId: string; chainId: number; address: string }>(userId, {
            networkPluginId: networkPluginId ?? NetworkPluginID.PLUGIN_EVM,
            chainId: chainId ?? ChainId.Mainnet,
            address,
        })
    } catch {
        // do nothing
    } finally {
        const _address = await getUserAddress(userId, networkPluginId, chainId)
        if (!isSameAddress(_address, address))
            throw new Error('Something went wrong, and please check your connection.')
    }
}
