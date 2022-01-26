import { RSS3 } from '@masknet/web3-providers'
import type { Constant } from '@masknet/web3-shared-evm/constants/utils'
import { personalSign } from '../../../extension/background-script/EthereumService'
import type { ConfigRSSNode, EssayRSSNode, PetMetaDB } from '../types'
import { NFTS_CONFIG_ADDRESS } from '../constants'

const cache = new Map<string, Record<string, Constant> | undefined>()

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

export async function getConfigNFTsFromRSS() {
    const v = cache.get(NFTS_CONFIG_ADDRESS)
    if (v) return v
    const rss = RSS3.createRSS3(NFTS_CONFIG_ADDRESS, async (message: string) => {
        return personalSign(message, NFTS_CONFIG_ADDRESS)
    })
    const data = await RSS3.getFileData<ConfigRSSNode>(rss, NFTS_CONFIG_ADDRESS, '_pet_nfts')
    cache.set(NFTS_CONFIG_ADDRESS, data?.essay)
    return data?.essay
}
