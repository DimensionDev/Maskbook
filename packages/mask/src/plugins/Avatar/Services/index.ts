import { isSameAddress } from '@masknet/web3-shared-evm'
import { personalSign } from '../../../extension/background-script/EthereumService'
import type { AvatarMetaDB } from '../types'
import { getNFTAvatarFromJSON } from './db'
import { getUserAddress, setUserAddress } from './gun'
import { getNFTAvatarFromRSS, getSignature, saveNFTAvatarToRSS } from './rss3'

export async function getNFTAvatar(userId: string) {
    let result
    const address = await getUserAddress(userId)
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

async function getAddressSignature(userId: string, address: string) {
    const _address = await getUserAddress(userId)
    if (!_address) return

    if (!isSameAddress(address, _address)) return

    return getSignature(userId, _address)
}

export async function saveNFTAvatar(address: string, nft: AvatarMetaDB) {
    let signature
    signature = await getAddressSignature(nft.userId, address)
    if (!signature) {
        signature = await personalSign(nft.userId, address)
        setUserAddress(nft.userId, address)
    }
    const avatar = await saveNFTAvatarToRSS(address, nft, signature)
    return avatar
}

export async function getAddress(userId: string) {
    const address = await getUserAddress(userId)
    return (address ?? '') as string
}

export { getNFTContractVerifiedFromJSON } from './verified'
