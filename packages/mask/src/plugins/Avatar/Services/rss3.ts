import { personalSign } from '../../../extension/background-script/EthereumService'
import type { AvatarMetaDB } from '../types'
import addSeconds from 'date-fns/addSeconds'
import { RSS3 } from '@masknet/web3-providers'

interface NFTRSSNode {
    signature: string
    nft: AvatarMetaDB
}

const cache = new Map<string, [Promise<NFTRSSNode | undefined>, number]>()

export async function getNFTAvatarFromRSS(userId: string, address: string) {
    const key = `${address}, ${userId}`
    let v = cache.get(key)
    if (!v || Date.now() > v[1]) {
        cache.set(key, [_getNFTAvatarFromRSS(userId, address), addSeconds(Date.now(), 60).getTime()])
    }

    v = cache.get(key)
    const result = await v?.[0]
    return result?.nft
}

async function _getNFTAvatarFromRSS(userId: string, address: string): Promise<NFTRSSNode | undefined> {
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return personalSign(message, address)
    })

    const nfts = await RSS3.getFileData<Record<string, NFTRSSNode>>(rss, address, '_nfts')
    if (nfts) {
        return nfts[userId]
    }
    return RSS3.getFileData<NFTRSSNode>(rss, address, '_nft')
}

export async function saveNFTAvatarToRSS(address: string, nft: AvatarMetaDB, signature: string) {
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return personalSign(message, address)
    })

    let _nfts = await RSS3.getFileData<Record<string, NFTRSSNode>>(rss, address, '_nfts')
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

    await RSS3.setFileData(rss, address, '_nfts', _nfts)

    // clear cache
    if (cache.has(address)) cache.delete(address)

    return nft
}
