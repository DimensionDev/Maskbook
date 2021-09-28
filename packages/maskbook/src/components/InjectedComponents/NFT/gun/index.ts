import type { Wallet } from '@masknet/web3-shared'
import type Web3 from 'web3'
import type { Persona } from '../../../../database'
import type { AvatarMetaDB } from '../types'
import { getProfileIdentitierFromPersona } from '../utils/getProfileIdentitierFromPersona'
import { getNFTAvatarFromJSON } from './db'
import { getNFTAvatarFromRSS, saveNFTAvatarFromRSS } from './rss'

export async function getNFTAvatar(persona: Persona, web3: Web3) {
    const a = await getNFTAvatarFromRSS(persona, web3)
    if (a) return a

    const identifier = getProfileIdentitierFromPersona(persona)
    if (!identifier) return

    const b = await getNFTAvatarFromJSON(identifier?.userId)
    return b
}

export async function saveNFTAvatar(persona: Persona, wallet: Wallet, nft: AvatarMetaDB) {
    const avatar = await saveNFTAvatarFromRSS(persona, wallet, nft)
    return avatar
}
