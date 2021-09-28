import type { Wallet } from '@masknet/web3-shared'
import RSS3 from 'rss3-next'
import type Web3 from 'web3'
import type { Persona } from '../../../../database'
import Services from '../../../../extension/service'
import { currentAccountSettings } from '../../../../plugins/Wallet/settings'
import { AvatarMetaDB, RSS3_APP } from '../types'
import { ethAddrFrom } from '../utils/address'

interface NFTRSSNode {
    address: string
    signature: string
    nft: AvatarMetaDB
}

async function createRSS(address?: string) {
    const rss3 = new RSS3({
        endpoint: RSS3_APP,
        address: address ?? currentAccountSettings.value,
    })

    return rss3
}

export async function getNFTAvatarFromRSS(persona: Persona, web3: Web3) {
    const _address = await ethAddrFrom(persona.identifier.toText())
    if (!_address) return

    const rss = await createRSS(_address)
    const res = await rss?.files.get(rss.account.address)
    const nft = Object.getOwnPropertyDescriptor(res, '_nft') as NFTRSSNode
    if (!nft) return

    const wallet = web3.eth.accounts.recover(_address, nft.signature)
    if (wallet !== nft.address) return null
    return nft.nft
}

export async function saveNFTAvatarFromRSS(persona: Persona, wallet: Wallet, nft: AvatarMetaDB) {
    const _address = await ethAddrFrom(persona.identifier.toText())
    if (!_address) return

    const rss = await createRSS(_address)
    const file = await rss.files.get(rss.account.address)
    if (!file) {
        console.log('save error')
        return
    }

    const result = await Services.Identity.signWithPersona({ message: wallet.address, method: 'eth' })
    console.log(result)
    const f = Object.assign(file, {
        _nft: {
            wallet: wallet.address,
            signature: result.signature.signature,
            nft,
        },
    })

    rss.files.set(file)
    await rss.files.sync()
    const res = await rss.files.get(rss.account.address)
    return Object.getOwnPropertyDescriptor(res, '_nft') as AvatarMetaDB
}
