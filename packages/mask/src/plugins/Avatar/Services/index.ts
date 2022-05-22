import type { NetworkPluginID } from '@masknet/plugin-infra/web3'
import type { AvatarMetaDB } from '../types'
import { getNFTAvatarFromJSON } from './db'
import { getUserAddress, setUserAddress } from './bind'
import { deleteTargetCache, getNFTAvatarFromRSS, saveNFTAvatarToRSS } from './rss3'
import type { RSS3_KEY_SNS } from '../constants'

export async function getNFTAvatar(
    userId: string,
    network: string,
    snsKey: RSS3_KEY_SNS,
    networkPluginId?: NetworkPluginID,
    chainId?: number,
) {
    const address = await getUserAddress(userId, network, networkPluginId, chainId)

    if (address) {
        return getNFTAvatarFromRSS(userId, address, snsKey)
    }
    return getNFTAvatarFromJSON(userId)
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

export async function saveNFTAvatar(
    address: string,
    nft: AvatarMetaDB,
    network: string,
    snsKey: RSS3_KEY_SNS,
    networkPluginId?: NetworkPluginID,
    chainId?: number,
) {
    const avatar = await saveNFTAvatarToRSS(address, nft, '', snsKey)
    await setUserAddress(nft.userId, address, network, networkPluginId, chainId)
    return avatar
}

export async function getAddress(userId: string, network: string, networkPluginId?: NetworkPluginID, chainId?: number) {
    if (!userId) return ''
    const address = await getUserAddress(userId, network, networkPluginId, chainId)
    return (address ?? '') as string
}

export async function getImage(image: string): Promise<string> {
    const response = await globalThis.fetch(image)
    return (await blobToBase64(await response.blob())) as string
}

function blobToBase64(blob: Blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
}
