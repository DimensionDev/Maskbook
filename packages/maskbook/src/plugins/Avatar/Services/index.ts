import type Web3 from 'web3'
import type { AvatarMetaDB } from '../types'
import { getNFTAvatarFromJSON } from './db'
import { getUserAddress, setUserAddress } from './gun'
import { getNFTAvatarFromRSS, saveNFTAvatarFromRSS } from './rss'

export async function getNFTAvatar(userId: string, web3: Web3) {
    console.log(userId)
    const address = await getUserAddress(userId)
    console.log(address)
    if (!address) return

    console.log(address)
    let result = await getNFTAvatarFromRSS(address, web3)
    if (!result) {
        result = await getNFTAvatarFromJSON(userId)
    }
    return result
}

export async function saveNFTAvatar(web3: Web3, address: string, nft: AvatarMetaDB) {
    await setUserAddress(nft.userId, address)
    const avatar = await saveNFTAvatarFromRSS(web3, address, nft)
    return avatar
}
