import Web3 from 'web3'
import RSS3 from 'rss3-next'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { personalSign } from '../../../extension/background-script/EthereumService'
import { RSS3_APP } from '../constants'
import type { AvatarMetaDB } from '../types'
import addSeconds from 'date-fns/addSeconds'

interface NFTRSSNode {
    signature: string
    nft: AvatarMetaDB
}

export async function createRSS3(address: string) {
    return new RSS3({
        endpoint: RSS3_APP,
        address,
        sign: async (message: string) => {
            return personalSign(message, address)
        },
    })
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

    const sig_address = web3.eth.accounts.recover(nft.nft.userId, nft.signature)
    if (!isSameAddress(sig_address, address)) return
    return nft.nft
}

async function _getNFTAvatarFromRSS(
    address: string,
): Promise<{ type: string; nfts: Record<string, NFTRSSNode> | NFTRSSNode } | undefined> {
    const rss = await createRSS3(address)
    const file = await rss.files.get(rss.account.address)

    const nfts = Object.getOwnPropertyDescriptor(file, '_nfts')
    if (nfts?.value) {
        return {
            type: 'NFTS',
            nfts: nfts.value as Record<string, NFTRSSNode>,
        }
    } else {
        const nft = Object.getOwnPropertyDescriptor(file, '_nft')
        if (!nft || !nft?.value) return
        return {
            type: 'NFT',
            nfts: nft.value as NFTRSSNode,
        }
    }
}

export async function saveNFTAvatarToRSS(address: string, nft: AvatarMetaDB, signature: string) {
    const rss = await createRSS3(address)
    if (!rss) return

    const file = await rss.files.get(rss.account.address)
    if (!file) throw new Error('The account was not found.')

    let _nfts = Object.getOwnPropertyDescriptor(file, '_nfts')?.value as Record<string, NFTRSSNode> | undefined
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

    rss.files.set(Object.assign(file, { _nfts }))
    await rss.files.sync()

    // clear cache
    if (cache.has(address)) cache.delete(address)

    return nft
}

export async function getRSSNode(address: string) {
    const rss = await createRSS3(address)
    const file = await rss.files.get(rss.account.address)
    const nft = Object.getOwnPropertyDescriptor(file, '_nfts')
    if (!nft?.value) return
    return file
}
