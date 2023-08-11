import { PluginID, NetworkPluginID, EnhanceableSite, getSiteType } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export const NFT_AVATAR_DB_NAME = 'com.maskbook.user'
export const NFT_AVATAR_METADATA_STORAGE = 'com.maskbook.avatar.metadata.storage'

export const PLUGIN_ID = PluginID.Avatar
export const PLUGIN_NAME = 'Avatar'
export const PLUGIN_DESCRIPTION = 'NFT Avatar'

export enum RSS3_KEY_SITE {
    TWITTER = '_nfts',
    FACEBOOK = '_facebook_nfts',
    INSTAGRAM = '_instagram_nfts',
}

export const SUPPORTED_CHAIN_IDS: ChainId[] = [ChainId.Mainnet, ChainId.Matic, ChainId.BSC]

export const supportPluginIds = [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_FLOW, NetworkPluginID.PLUGIN_SOLANA]

export const StorageKey = `${PLUGIN_NAME}-${(getSiteType() || EnhanceableSite.Twitter).replace('.com', '')}`
