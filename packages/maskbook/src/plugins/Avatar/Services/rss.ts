import { isSameAddress } from '@masknet/web3-shared'
import RSS3 from 'rss3-next'
import Web3 from 'web3'
import { personalSign } from '../../../extension/background-script/EthereumService'
import { RSS3_APP } from '../constants'
import type { AvatarMetaDB } from '../types'

interface NFTRSSNode {
    address: string
    signature: string
    nft: AvatarMetaDB
}

export async function createRSS(address: string) {
    return new RSS3({
        endpoint: RSS3_APP,
        address,
        sign: async (message: string) => {
            console.log('DEBUG: sign message')
            console.log({
                message,
            })
            return personalSign(message, address)
        },
    })
}

export async function getNFTAvatarFromRSS(address: string) {
    const rss = await createRSS(address)
    const file = await rss.files.get(rss.account.address)
    const nft = Object.getOwnPropertyDescriptor(file, '_nft')
    if (!nft?.value) return
    const data = nft.value as NFTRSSNode

    const web3 = new Web3()
    const result = web3.eth.accounts.recover(data.nft.userId, data.signature)
    if (!isSameAddress(result, address)) return
    return data.nft
}

export async function saveNFTAvatarFromRSS(address: string, nft: AvatarMetaDB) {
    const rss = await createRSS(address)
    if (!rss) return

    const file = await rss.files.get(rss.account.address)
    if (!file) {
        throw new Error('Not Found')
    }

    const signature = await personalSign(nft.userId, address)

    const f = Object.assign(file, {
        _nft: {
            signature: String(signature),
            nft: nft,
        },
    })

    rss.files.set(f)
    await rss.files.sync()

    return nft
}
