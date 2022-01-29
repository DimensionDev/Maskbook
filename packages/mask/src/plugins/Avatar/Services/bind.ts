import { ChainId, isSameAddress } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/plugin-infra'
import addSeconds from 'date-fns/addSeconds'
import { KeyValue } from '@masknet/web3-providers'
import { NFT_AVATAR_DB_NAME, NFT_AVATAR_DB_NAME_STORAGE } from '../constants'
import { gun2 } from '../../../network/gun/version.2'

const NFTAvatarGUN = gun2.get(NFT_AVATAR_DB_NAME)
const READ_GUN_RETRIES = 10
const READ_GUN_TIMEOUT = 15 * 1000 // timeout 1 minute

const NFTAvatarDB = (network: string) => KeyValue.createJSON_Storage(NFT_AVATAR_DB_NAME + '_' + network)
const NFTAvatarDBStorage = (network: string) => KeyValue.createJSON_Storage(NFT_AVATAR_DB_NAME_STORAGE + '_' + network)

const cache = new Map<string, [Promise<string | undefined>, number]>()

function timeout<T>(promise: PromiseLike<T>, duration: number): Promise<T | undefined> {
    return Promise.race([promise, new Promise<void>((resolve) => setTimeout(() => resolve(), duration))])
}

async function getDataFromGUN(userId: string) {
    return (
        NFTAvatarGUN
            // @ts-expect-error
            .get(userId).then!()
    )
}

async function getUserAddressFromGUN(userId: string): Promise<string | undefined> {
    return timeout(getDataFromGUN(userId), READ_GUN_TIMEOUT)
}

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
            if (address) return address
            return getUserAddressFromGUN(userId)
        }
        return result.address
    } catch {
        return getUserAddressFromGUN(userId)
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
            console.log(err)
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
        await NFTAvatarDBStorage(network).set<Record<string, string>>(userId, {
            [getKey(networkPluginId, chainId)]: address,
        })

        await NFTAvatarDB(network).set<{ networkPluginId: string; chainId: number; address: string }>(userId, {
            networkPluginId: networkPluginId ?? NetworkPluginID.PLUGIN_EVM,
            chainId: chainId ?? ChainId.Mainnet,
            address,
        })
    } catch {
        // do nothing
    } finally {
        const _address = await getUserAddress(userId, network, networkPluginId, chainId)
        if (!isSameAddress(_address, address))
            throw new Error('Network issues, please make sure you are connected to the appropriate internet.')
    }
}
