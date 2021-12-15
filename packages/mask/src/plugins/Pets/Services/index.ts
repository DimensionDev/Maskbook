import { getCustomEssayFromRSS, saveCustomEssayToRSS } from './rss3'
import { personalSign } from '../../../extension/background-script/EthereumService'
import type { PetMetaDB } from '../types'
export * from './opensea'

export async function saveEssay(address: string, petMeta: PetMetaDB, userId: string): Promise<PetMetaDB | undefined> {
    const signature = await personalSign(userId, address)
    return saveCustomEssayToRSS(address, petMeta, signature)
}

export function getEssay(address: string): Promise<PetMetaDB | undefined> {
    return getCustomEssayFromRSS(address)
}
