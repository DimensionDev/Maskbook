import type { NetworkPluginID } from '@masknet/plugin-infra'
import { personalSign } from '../../../extension/background-script/EthereumService'
import type { AvatarMetaDB } from '../types'
import { getNFTAvatarFromJSON } from './db'
import { getUserAddress, setUserAddress } from './bind'
import { getNFTAvatarFromRSS, saveNFTAvatarToRSS } from './rss3'

export async function getNFTAvatar(userId: string, networkPluginId?: NetworkPluginID, chainId?: number) {
    let result
    const address = await getUserAddress(userId, networkPluginId, chainId)
    if (!address) {
        result = await getNFTAvatarFromJSON(userId)
        return result
    }

    result = await getNFTAvatarFromRSS(userId, address)
    if (!result) {
        result = await getNFTAvatarFromJSON(userId)
    }

    return result
}

export async function saveNFTAvatar(
    address: string,
    nft: AvatarMetaDB,
    networkPluginId?: NetworkPluginID,
    chainId?: number,
) {
    const signature = await personalSign(nft.userId, address)
    setUserAddress(nft.userId, address, networkPluginId, chainId)
    const avatar = await saveNFTAvatarToRSS(address, nft, signature)
    return avatar
}

export async function getAddress(userId: string, networkPluginId?: NetworkPluginID, chainId?: number) {
    const address = await getUserAddress(userId, networkPluginId, chainId)
    return (address ?? '') as string
}

export { getNFTContractVerifiedFromJSON } from './verified'

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
