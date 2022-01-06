import { RSS3 } from '@masknet/web3-providers'
import { personalSign } from '../../../extension/background-script/EthereumService'
import type { EssayRSSNode, PetMetaDB } from '../types'

export async function getCustomEssayFromRSS(address: string): Promise<PetMetaDB | undefined> {
    if (!address) return
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return personalSign(message, address)
    })
    const data = await RSS3.getFileData<EssayRSSNode>(rss, address, '_pet')
    return data?.essay
}

export async function saveCustomEssayToRSS(address: string, essay: PetMetaDB, signature: string) {
    if (!address) return
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return personalSign(message, address)
    })
    await RSS3.setFileData<EssayRSSNode>(rss, address, '_pet', { address, signature, essay })
    return essay
}
