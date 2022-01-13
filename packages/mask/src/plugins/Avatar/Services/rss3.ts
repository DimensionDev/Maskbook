import Web3 from 'web3'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { personalSign } from '../../../extension/background-script/EthereumService'
import type { AvatarMetaDB } from '../types'
import addSeconds from 'date-fns/addSeconds'
import { RSS3 } from '@masknet/web3-providers'
import isBefore from 'date-fns/isBefore'

interface NFTRSSNode {
    signature: string
    nft: AvatarMetaDB
}

const cache = new Map<string, [Promise<NFTRSSNode | undefined>, Date]>()

function CheckAddress(userId: string, sign: string, address: string) {
    const web3 = new Web3()
    try {
        const sig_address = web3.eth.accounts.recover(userId, sign)
        return isSameAddress(sig_address, address)
    } catch {
        throw new Error('Failed to recover signature, and please check your connection.')
    }
}

export async function getNFTAvatarFromRSS(userId: string, address: string) {
    const nft = await _getNFTAvatarFromRSSFromCache(userId, address)
    if (!nft) return

    if (!CheckAddress(nft.nft.userId, nft.signature, address)) return
    return nft.nft
}

async function _getNFTAvatarFromRSSFromCache(userId: string, address: string) {
    let v = cache.get(address)
    if (!v || isBefore(new Date(), v[1])) {
        cache.set(address, [_getNFTAvatarFromRSS(userId, address), addSeconds(Date.now(), 60)])
    }
    v = cache.get(address)
    return v?.[0]
}

async function _getNFTAvatarFromRSS(userId: string, address: string): Promise<NFTRSSNode | undefined> {
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return personalSign(message, address)
    })

    const nfts = await RSS3.getFileData<Record<string, NFTRSSNode>>(rss, address, '_nfts')
    if (nfts) return nfts[userId]
    else return RSS3.getFileData<NFTRSSNode>(rss, address, '_nft')
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
    try {
        await RSS3.setFileData(rss, address, '_nfts', _nfts)
    } catch {
        throw new Error('Something went wrong, and please check your connection.')
    }

    // clear cache
    if (cache.has(address)) cache.delete(address)

    return nft
}

export async function getSignature(userId: string, address: string) {
    const nft = await _getNFTAvatarFromRSSFromCache(userId, address)
    if (!nft) return
    if (!CheckAddress(userId, nft.signature, address)) return
    return nft.signature
}
