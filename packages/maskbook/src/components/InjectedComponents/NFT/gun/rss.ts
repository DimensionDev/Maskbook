import type { Wallet } from '@masknet/web3-shared'
import RSS3 from 'rss3-next'
import type Web3 from 'web3'
import type { Persona } from '../../../../database'
import Services from '../../../../extension/service'
import { AvatarMetaDB, RSS3_APP } from '../types'
import { ethAddrFrom } from '../utils/address'

interface NFTRSSNode {
    address: string
    signature: string
    nft: AvatarMetaDB
}

export async function createRSS(persona: Persona) {
    const address = await ethAddrFrom(persona.identifier.toText())
    if (!address) return

    return new RSS3({
        endpoint: RSS3_APP,
        address,
    })
}

export async function getNFTAvatarFromRSS(persona: Persona, web3: Web3) {
    const rss = await createRSS(persona)
    if (!rss) return
    const file = await rss.files.get(rss.account.address)
    const nft = Object.getOwnPropertyDescriptor(file, '_nft')
    if (!nft) return
    const wallet = web3.eth.accounts.recover(rss.account.address, nft.value.signature)
    if (wallet !== nft.value.address) return null
    return nft.value.nft
}

export async function saveNFTAvatarFromRSS(persona: Persona, wallet: Wallet, nft: AvatarMetaDB) {
    const rss = await createRSS(persona)
    if (!rss) return

    const file = await rss.files.get(rss.account.address)
    if (!file) {
        throw new Error('Not Found')
    }

    const result = await Services.Identity.signWithPersona({ message: wallet.address, method: 'eth' })
    const f = Object.assign(file, {
        _nft: {
            wallet: wallet.address,
            signature: result.signature.signature,
            nft,
        },
    })

    rss.files.set(file)
    await rss.files.sync()

    return nft
}
