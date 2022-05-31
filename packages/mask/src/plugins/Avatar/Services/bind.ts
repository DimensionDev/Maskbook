import { NetworkPluginID, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import addSeconds from 'date-fns/addSeconds'
import { KeyValue } from '@masknet/web3-providers'
import { NFT_AVATAR_DB_NAME, NFT_AVATAR_DB_NAME_STORAGE } from '../constants'

const READ_GUN_TIMEOUT = 15 * 1000

const NFTAvatarDB = (network: string) => KeyValue.createJSON_Storage(NFT_AVATAR_DB_NAME + '_' + network)
const NFTAvatarDBStorage = (network: string) => KeyValue.createJSON_Storage(NFT_AVATAR_DB_NAME_STORAGE + '_' + network)

const cache = new Map<string, [Promise<string | undefined>, number]>()

function getKey(networkPluginId = NetworkPluginID.PLUGIN_EVM, chainId: number = ChainId.Mainnet) {
    return `${networkPluginId}-${chainId}`
}

function getCacheKey(
    userId: string,
    network: string,
    networkPluginId = NetworkPluginID.PLUGIN_EVM,
    chainId: number = ChainId.Mainnet,
) {
    return `${userId}-${network}-${networkPluginId}-${chainId}`
}

async function _getUserAddress(userId: string, network: string, networkPluginId?: NetworkPluginID, chainId?: number) {
    try {
        const result = await NFTAvatarDB(network).get<{ networkPluginId: string; chainId: number; address: string }>(
            userId,
        )
        if (!result || !result?.address) {
            const result = await NFTAvatarDBStorage(network).get<Record<string, string>>(userId)
            const address = result?.[getKey(networkPluginId, chainId)]
            return address
        }
        return result.address
    } catch (error) {
        console.error(error)
        return
    }
}

export async function getUserAddress(
    userId: string,
    network: string,
    networkPluginId?: NetworkPluginID,
    chainId?: number,
) {
    let c = cache.get(getCacheKey(userId, network, networkPluginId, chainId))
    if (!c || Date.now() > c[1]) {
        try {
            cache.set(getCacheKey(userId, network, networkPluginId, chainId), [
                _getUserAddress(userId, network, networkPluginId, chainId),
                addSeconds(new Date(), 60).getTime(),
            ])
        } catch (err) {
            console.error(err)
        }
    }
    c = cache.get(getCacheKey(userId, network, networkPluginId, chainId))

    return c?.[0]
}

export async function setUserAddress(
    userId: string,
    address: string,
    network: string,
    networkPluginId?: NetworkPluginID,
    chainId?: number,
) {
    try {
        await NFTAvatarDBStorage(network).set(userId, {
            [getKey(networkPluginId, chainId)]: address,
        })
        await NFTAvatarDB(network).set(userId, {
            networkPluginId: networkPluginId ?? NetworkPluginID.PLUGIN_EVM,
            chainId: chainId ?? ChainId.Mainnet,
            address,
        })
    } catch {
        // do nothing
    }
    const userAddress = await getUserAddress(userId, network, networkPluginId, chainId)
    if (isSameAddress(userAddress, address)) return
    throw new Error('Network issues, please make sure you are connected to the appropriate internet.')
}
