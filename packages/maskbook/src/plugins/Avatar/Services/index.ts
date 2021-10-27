import { personalSign } from '../../../extension/background-script/EthereumService'
import type { AvatarMetaDB } from '../types'
import { getNFTAvatarFromJSON } from './db'
import { getUserAddress, setUserAddress } from './gun'
import { getNFTAvatarFromRSS, saveNFTAvatarFromRSS } from './rss'

export async function getNFTAvatar(userId: string) {
    let result
    const address = await getUserAddress(userId)
    if (!address) {
        result = await getNFTAvatarFromJSON(userId)
        return result
    }
    result = await getNFTAvatarFromRSS(address)
    if (!result) {
        result = await getNFTAvatarFromJSON(userId)
    }
    return result
}

export async function saveNFTAvatar(address: string, nft: AvatarMetaDB) {
    const signature = await personalSign(nft.userId, address)
    setUserAddress(nft.userId, address)
    const avatar = await saveNFTAvatarFromRSS(address, nft, signature)
    return avatar
}

export async function getAddress(userId: string) {
    const address = await getUserAddress(userId)
    return address
}

export { getNFTContractVerifiedFromJSON } from './verified'
