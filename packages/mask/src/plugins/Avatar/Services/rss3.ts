import type { AvatarMetaDB } from '../types'
import addSeconds from 'date-fns/addSeconds'
import { RSS3 } from '@masknet/web3-providers'
import type { RSS3_KEY_SNS } from '../constants'
import { WalletRPC } from '../../Wallet/messages'

interface NFTRSSNode {
    signature: string
    nft: AvatarMetaDB
}

const cache = new Map<string, [Promise<NFTRSSNode | undefined>, number]>()

export async function getNFTAvatarFromRSS(userId: string, address: string, snsKey: RSS3_KEY_SNS) {
    const key = `${address}, ${userId}, ${snsKey}`
    let v = cache.get(key)
    if (!v || Date.now() > v[1]) {
        cache.set(key, [_getNFTAvatarFromRSS(userId, address, snsKey), addSeconds(Date.now(), 60).getTime()])
    }

    v = cache.get(key)
    const result = await v?.[0]
    return result?.nft
}

export function deleteTargetCache(userId: string, address: string, snsKey: RSS3_KEY_SNS) {
    const key = `${address}, ${userId}, ${snsKey}`
    cache.delete(key)
}

async function _getNFTAvatarFromRSS(
    userId: string,
    address: string,
    snsKey: RSS3_KEY_SNS,
): Promise<NFTRSSNode | undefined> {
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return WalletRPC.signPersonalMessage(message, address)
    })

    const nfts = await RSS3.getFileData<Record<string, NFTRSSNode>>(rss, address, snsKey)
    if (nfts) {
        return nfts[userId]
    }
    return RSS3.getFileData<NFTRSSNode>(rss, address, '_nft')
}

export async function saveNFTAvatarToRSS(address: string, nft: AvatarMetaDB, signature: string, snsKey: RSS3_KEY_SNS) {
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return WalletRPC.signPersonalMessage(message, address)
    })

    let _nfts = await RSS3.getFileData<Record<string, NFTRSSNode>>(rss, address, snsKey)
    if (!_nfts) {
        _nfts = {
            [nft.userId]: { signature, nft },
        }
    } else {
        _nfts[nft.userId] = {
            signature,
            nft,
        }
    }

    await RSS3.setFileData(rss, address, snsKey, _nfts)

    // clear cache
    if (cache.has(address)) cache.delete(address)

    return nft
}
