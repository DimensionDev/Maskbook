import Web3 from 'web3'
import { isSameAddress } from '@masknet/web3-shared-evm'
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
    const nft = await _getNFTAvatarFromRSSFromCache(userId, address)
    if (!nft) return
    const web3 = new Web3()
    const sig_address = web3.eth.accounts.recover(nft.nft.userId, nft.signature)
    if (!isSameAddress(sig_address, address)) return
    return nft.nft
}

async function _getNFTAvatarFromRSSFromCache(userId: string, address: string) {
    let v = cache.get(address)
    if (!v || Date.now() > v[1]) {
        cache.set(address, [_getNFTAvatarFromRSS(userId, address), addSeconds(Date.now(), 60).getTime()])
    }

    v = cache.get(address)
    const nft = await v?.[0]
    if (!nft) return
    return nft
}

async function _getNFTAvatarFromRSS(userId: string, address: string): Promise<NFTRSSNode | undefined> {
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return personalSign(message, address)
    })

    const nfts = await RSS3.getFileData<Record<string, NFTRSSNode>>(rss, address, '_nfts')
    if (nfts) {
        const data = nfts as Record<string, NFTRSSNode>
        return data[userId]
    } else {
        const nft = await RSS3.getFileData<NFTRSSNode>(rss, address, '_nft')
        if (nft) return nft
    }
    return
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

export async function getSignature(userId: string, address: string) {
    const nft = await _getNFTAvatarFromRSSFromCache(userId, address)
    if (!nft) return
    const web3 = new Web3()
    const sig_address = web3.eth.accounts.recover(userId, nft.signature)
    if (!isSameAddress(sig_address, address)) return
    return nft.signature
}
