import { RSS3 } from '@masknet/web3-providers'
import type { Constant } from '@masknet/web3-shared-base/src/utils/types'
import type { ConfigRSSNode, EssayRSSNode, PetMetaDB } from '../types'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const cache = new Map<string, Record<string, Constant> | undefined>()

export async function getCustomEssayFromRSS(
    address: string,
    connection: Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM>,
): Promise<PetMetaDB | undefined> {
    if (!address) return
    const rss = RSS3.createRSS3(address, async (message: string) => {
        return connection.signMessage(message, 'personalSign', { account: address })
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

export async function getConfigNFTsFromRSS(
    connection: Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM>,
    configAddress: string,
) {
    const v = cache.get(configAddress)
    if (v) return v
    const rss = RSS3.createRSS3(configAddress, async (message: string) => {
        return connection.signMessage(message, 'personalSign', { account: configAddress })
    })
    const data = await RSS3.getFileData<ConfigRSSNode>(rss, configAddress, '_pet_nfts')
    cache.set(configAddress, data?.essay)
    return data?.essay
}
