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

const cache = new Map<
    string,
    [Promise<{ type: string; nfts: Record<string, NFTRSSNode> | NFTRSSNode } | undefined>, number]
>()

export async function getNFTAvatarFromRSS(userId: string, address: string) {
    let v = cache.get(address)
    if (!v || Date.now() > v[1]) {
        cache.set(address, [_getNFTAvatarFromRSS(address), addSeconds(Date.now(), 60).getTime()])
    }

    v = cache.get(address)
    const result = await v?.[0]
    if (!result) return
    const { type, nfts } = result

    const web3 = new Web3()
    let nft: NFTRSSNode
    if (type === 'NFTS') {
        const data = nfts as Record<string, NFTRSSNode>
        nft = data[userId]
    } else {
        nft = nfts as NFTRSSNode
    }

    try {
        const sig_address = web3.eth.accounts.recover(nft.nft.userId, nft.signature)
        if (!isSameAddress(sig_address, address)) return
        return nft.nft
    } catch {
        throw new Error('Failed to recover signature.')
    }
}

async function _getNFTAvatarFromRSS(
    address: string,
): Promise<{ type: string; nfts: Record<string, NFTRSSNode> | NFTRSSNode } | undefined> {
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return personalSign(message, address)
    })

    const nfts = await RSS3.getFileData<Record<string, NFTRSSNode>>(rss, address, '_nfts')
    if (nfts) {
        return {
            type: 'NFTS',
            nfts,
        }
    } else {
        const nft = await RSS3.getFileData<NFTRSSNode>(rss, address, '_nft')
        if (!nft) return
        return {
            type: 'NFT',
            nfts: nft,
        }
    }
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
