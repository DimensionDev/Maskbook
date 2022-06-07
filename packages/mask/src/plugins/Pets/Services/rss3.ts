import { RSS3 } from '@masknet/web3-providers'
import type { Constant } from '@masknet/web3-shared-base/src/utils/types'
import type { ConfigRSSNode, EssayRSSNode, PetMetaDB } from '../types'
import { NFTS_BLOCK_ADDRESS } from '../constants'
import { WalletRPC } from '../../Wallet/messages'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const cache = new Map<string, Record<string, Constant> | undefined>()

export async function getCustomEssayFromRSS(address: string): Promise<PetMetaDB | undefined> {
    if (!address) return
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return WalletRPC.signPersonalMessage(message, address)
    })
    const data = await RSS3.getFileData<EssayRSSNode>(rss, address, '_pet')
    return data?.essay
}

export async function saveCustomEssayToRSS(
    address: string,
    essay: PetMetaDB,
    signature: string,
    connection: Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM>,
) {
    if (!address) return
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return connection.signMessage(message, 'personalSign', { account: address })
    })
    await RSS3.setFileData<EssayRSSNode>(rss, address, '_pet', { address, signature, essay })
    return essay
}

export async function getConfigNFTsFromRSS() {
    const v = cache.get(NFTS_BLOCK_ADDRESS)
    if (v) return v
    const rss = RSS3.createRSS3(NFTS_BLOCK_ADDRESS, async (message: string) => {
        return WalletRPC.signPersonalMessage(message, NFTS_BLOCK_ADDRESS)
    })
    const data = await RSS3.getFileData<ConfigRSSNode>(rss, NFTS_BLOCK_ADDRESS, '_pet_nfts')
    cache.set(NFTS_BLOCK_ADDRESS, data?.essay)
    return data?.essay
}
