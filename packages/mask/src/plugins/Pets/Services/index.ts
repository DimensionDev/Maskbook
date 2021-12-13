import { getCustomEssayFromRSS, saveCustomEssayToRSS } from './rss3'
import { personalSign } from '../../../extension/background-script/EthereumService'
import type { PetMetaDB } from '../types'
export * from './opensea'

export async function saveEssay(address: string, petMeta: PetMetaDB, userId: string): Promise<PetMetaDB | undefined> {
    const signature = await personalSign(userId, address)
    const result = await saveCustomEssayToRSS(address, petMeta, signature)
    return result
}

export async function getEssay(address: string): Promise<PetMetaDB | undefined> {
    const result = await getCustomEssayFromRSS(address)
    return result
}
