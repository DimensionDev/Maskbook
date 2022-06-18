import { getCustomEssayFromRSS, getConfigNFTsFromRSS } from './rss3'
// import { personalSign } from '../../../extension/background-script/EthereumService'
import type { PetMetaDB } from '../types'

export * from './storage'

export function getEssay(address: string): Promise<PetMetaDB | undefined> {
    return getCustomEssayFromRSS(address)
}

export function getConfigEssay(): Promise<any> {
    return getConfigNFTsFromRSS()
}
