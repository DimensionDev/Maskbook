import RSS3 from 'rss3-next'
import type Web3 from 'web3'
import { hexToString } from 'web3-utils'
import { RSS3_APP } from '../constants'
import type { AvatarMetaDB } from '../types'

interface NFTRSSNode {
    address: string
    signature: string
    messagehex: string
    nft: AvatarMetaDB
}

export async function createRSS(address: string, web3: Web3) {
    return new RSS3({
        endpoint: RSS3_APP,
        address,
    })
}

export async function getNFTAvatarFromRSS(address: string, web3: Web3) {
    console.log('addr:', address)
    const rss = await createRSS(address, web3)
    if (!rss) return
    const file = await rss.files.get(rss.account.address)
    console.log(file)
    const nft = Object.getOwnPropertyDescriptor(file, '_nft')
    if (!nft?.value) return
    const data = nft.value as NFTRSSNode

    console.log(data)
    const result = web3.eth.accounts.recover(hexToString(data.messagehex), data.signature)
    console.log(result)
    if (result !== address) return
    return data.nft
}

export async function saveNFTAvatarFromRSS(web3: Web3, address: string, nft: AvatarMetaDB) {
    const rss = await createRSS(address, web3)
    if (!rss) return

    const file = await rss.files.get(rss.account.address)
    if (!file) {
        throw new Error('Not Found')
    }

    const f = Object.assign(file, {
        _nft: {
            nft: nft,
        },
    })

    rss.files.set(f)
    await rss.files.sync()
    return nft
}
